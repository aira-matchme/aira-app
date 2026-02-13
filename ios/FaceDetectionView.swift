import UIKit
import AVFoundation
import Vision
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

  private func moveTo(_ next: Step) {
    currentStep = next
    stableFrames = 0
    onLivenessStep?(["step": next.rawValue])
  }

  private func reset() {
    currentStep = .ALIGN_FACE
    stableFrames = 0
    onLivenessStep?(["step": Step.ALIGN_FACE.rawValue])
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
        self.reset()
        return
      }

      let yaw = faces[0].yaw?.floatValue ?? 0

      DispatchQueue.main.async {
        self.handleYaw(yaw)
      }
    }

    let handler = VNImageRequestHandler(
      cvPixelBuffer: pixelBuffer,
      orientation: .leftMirrored,
      options: [:]
    )

    try? handler.perform([request])
  }

  private func handleYaw(_ yaw: Float) {

    switch currentStep {

    case .ALIGN_FACE:
      stableFrames += 1
      if stableFrames >= REQUIRED_FRAMES {
        moveTo(.HOLD_STEADY)
      }

    case .HOLD_STEADY:
      stableFrames += 1
      if stableFrames >= REQUIRED_FRAMES {
        moveTo(.TURN_LEFT)
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
          moveTo(.VERIFIED)
        }
      } else {
        stableFrames = 0
      }

    case .VERIFIED:
      break
    }
  }
}
