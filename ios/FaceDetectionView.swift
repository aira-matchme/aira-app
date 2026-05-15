import UIKit
import AVFoundation
import Vision
import CoreImage
import React

@objc(FaceDetectionView)
class FaceDetectionView: UIView, AVCaptureVideoDataOutputSampleBufferDelegate {

  enum Step: String {
    case ALIGN_FACE
    case HOLD_STEADY
    case TURN_LEFT
    case TURN_RIGHT
    case VERIFIED
  }

  // MARK: - Camera

  private let session = AVCaptureSession()
  private let videoOutput = AVCaptureVideoDataOutput()
  private let queue = DispatchQueue(label: "liveness.queue")
  private var previewLayer: AVCaptureVideoPreviewLayer?

  // MARK: - Liveness State

  private var currentStep: Step = .ALIGN_FACE
  private var stableFrames = 0
  private let REQUIRED_FRAMES = 15

  // Event callback to React
  @objc var onLivenessStep: RCTDirectEventBlock?

  // MARK: - Lifecycle

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupCamera()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupCamera()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    previewLayer?.frame = bounds
  }

  override func removeFromSuperview() {
    super.removeFromSuperview()
    stopCamera()
  }

  // MARK: - Camera Setup

  private func setupCamera() {
    session.beginConfiguration()
    session.sessionPreset = .high

    guard
      let device = AVCaptureDevice.default(.builtInWideAngleCamera,
                                           for: .video,
                                           position: .front),
      let input = try? AVCaptureDeviceInput(device: device)
    else {
      session.commitConfiguration()
      return
    }

    if session.canAddInput(input) {
      session.addInput(input)
    }

    videoOutput.setSampleBufferDelegate(self, queue: queue)
    videoOutput.alwaysDiscardsLateVideoFrames = true
    videoOutput.videoSettings = [
      kCVPixelBufferPixelFormatTypeKey as String:
        kCVPixelFormatType_32BGRA
    ]

    if session.canAddOutput(videoOutput) {
      session.addOutput(videoOutput)
    }

    session.commitConfiguration()

    previewLayer = AVCaptureVideoPreviewLayer(session: session)
    previewLayer?.videoGravity = .resizeAspectFill
    previewLayer?.frame = bounds

    if let connection = previewLayer?.connection,
       connection.isVideoOrientationSupported {
      connection.videoOrientation = .portrait
    }

    if let layer = previewLayer {
      self.layer.addSublayer(layer)
    }

    session.startRunning()
  }

  private func stopCamera() {
    if session.isRunning {
      session.stopRunning()
    }
  }

  // MARK: - Liveness Logic

  private func emitStep(
    _ step: Step,
    imageUri: String? = nil,
    straightHeadImageUri: String? = nil
  ) {
    DispatchQueue.main.async {
      var payload: [String: Any] = ["step": step.rawValue]
      if let imageUri = imageUri { payload["imageUri"] = imageUri }
      if let straightHeadImageUri = straightHeadImageUri {
        payload["straightHeadImageUri"] = straightHeadImageUri
      }
      self.onLivenessStep?(payload as [AnyHashable: Any])
    }
  }

  private func moveTo(_ next: Step, imageUri: String? = nil) {
    currentStep = next
    stableFrames = 0
    emitStep(next, imageUri: imageUri)
  }

  private func reset() {
    currentStep = .ALIGN_FACE
    stableFrames = 0
    emitStep(.ALIGN_FACE)
  }

  /// Encode upright portrait JPEG (same orientation as Vision / on-screen preview).
  private func saveVerificationJPEG(from pixelBuffer: CVPixelBuffer) -> String? {
    // Front camera portrait: sensor buffer is landscape; bake .leftMirrored into pixels for upload.
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer).oriented(.leftMirrored)
    let context = CIContext()
    guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
    let uiImage = UIImage(cgImage: cgImage)
    guard let data = uiImage.jpegData(compressionQuality: 0.88) else { return nil }

    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("liveness_verify_\(UUID().uuidString).jpg")
    do {
      try data.write(to: url)
      return url.absoluteString
    } catch {
      return nil
    }
  }

  // MARK: - Frame Processing

  func captureOutput(_ output: AVCaptureOutput,
                     didOutput sampleBuffer: CMSampleBuffer,
                     from connection: AVCaptureConnection) {

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return
    }

    let request = VNDetectFaceLandmarksRequest { req, _ in
      guard let faces = req.results as? [VNFaceObservation],
            faces.count == 1 else {
        if self.currentStep == .VERIFIED { return }
        self.reset()
        return
      }

      let yaw = faces[0].yaw?.floatValue ?? 0
      self.handleYaw(yaw, pixelBuffer: pixelBuffer)
    }

    let handler = VNImageRequestHandler(
      cvPixelBuffer: pixelBuffer,
      orientation: .leftMirrored,
      options: [:]
    )

    try? handler.perform([request])
  }

  /// Runs on the same serial queue as `captureOutput` so `pixelBuffer` stays valid for JPEG export.
  private func handleYaw(_ yaw: Float, pixelBuffer: CVPixelBuffer) {

    switch currentStep {

    case .ALIGN_FACE:
      stableFrames += 1
      if stableFrames >= REQUIRED_FRAMES {
        moveTo(.HOLD_STEADY)
      }

    case .HOLD_STEADY:
      stableFrames += 1
      if stableFrames >= REQUIRED_FRAMES {
        // Frontal “head straight” frame — best match for reference-photo APIs vs. post-turn capture.
        let straightUri = saveVerificationJPEG(from: pixelBuffer)
        currentStep = .TURN_LEFT
        stableFrames = 0
        emitStep(.TURN_LEFT, straightHeadImageUri: straightUri)
      }

    case .TURN_LEFT:
      if yaw < -0.25 {
        stableFrames += 1
        if stableFrames >= REQUIRED_FRAMES {
          moveTo(.TURN_RIGHT)
        }
      } else {
        stableFrames = 0
      }

    case .TURN_RIGHT:
      if yaw > 0.25 {
        stableFrames += 1
        if stableFrames >= REQUIRED_FRAMES {
          let uri = saveVerificationJPEG(from: pixelBuffer)
          moveTo(.VERIFIED, imageUri: uri)
        }
      } else {
        stableFrames = 0
      }

    case .VERIFIED:
      break
    }
  }
}
