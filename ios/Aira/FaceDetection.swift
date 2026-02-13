import Foundation
import AVFoundation
import Vision
import React
import UIKit

@objc(FaceDetection)
class FaceDetection: RCTEventEmitter {

  enum Step: String {
    case ALIGN_FACE
    case HOLD_STEADY
    case TURN_LEFT
    case TURN_RIGHT
    case VERIFIED
  }

  private var currentStep: Step = .ALIGN_FACE
  private var stableFrames = 0
  private let REQUIRED_FRAMES = 15

  private let session = AVCaptureSession()
  private let videoOutput = AVCaptureVideoDataOutput()
  private let queue = DispatchQueue(label: "liveness.queue")

  private var previewLayer: AVCaptureVideoPreviewLayer?

  // MARK: - RN Setup

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func supportedEvents() -> [String]! {
    ["LIVENESS_STEP"]
  }

  // MARK: - Public API

  @objc
  func startCamera() {
    DispatchQueue.main.async {
      self.setupCamera()
    }
  }

  @objc
  func stopCamera() {
    DispatchQueue.main.async {
      if self.session.isRunning {
        self.session.stopRunning()
      }

      self.previewLayer?.removeFromSuperlayer()
      self.previewLayer = nil
    }
  }

  // MARK: - Camera Setup

  private func setupCamera() {
    guard let rootViewController = RCTPresentedViewController() else {
      return
    }

    let hostView: UIView = rootViewController.view
    hostView.layoutIfNeeded()

    session.beginConfiguration()
    session.sessionPreset = .high

    session.inputs.forEach { session.removeInput($0) }
    session.outputs.forEach { session.removeOutput($0) }

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

    let layer: AVCaptureVideoPreviewLayer
    if let existing = previewLayer {
      layer = existing
      layer.session = session
    } else {
      layer = AVCaptureVideoPreviewLayer(session: session)
      layer.videoGravity = .resizeAspectFill
      previewLayer = layer
      hostView.layer.insertSublayer(layer, at: 0)
    }

    layer.frame = hostView.bounds
    if let connection = layer.connection, connection.isVideoOrientationSupported {
      connection.videoOrientation = .portrait
    }

    if !session.isRunning {
      session.startRunning()
    }
  }

  // MARK: - State Machine

  private func moveTo(_ next: Step) {
    currentStep = next
    stableFrames = 0
    sendEvent(withName: "LIVENESS_STEP", body: ["step": next.rawValue])
  }

  private func reset() {
    currentStep = .ALIGN_FACE
    stableFrames = 0
    sendEvent(withName: "LIVENESS_STEP",
              body: ["step": Step.ALIGN_FACE.rawValue])
  }
}

// MARK: - Frame Processing

extension FaceDetection: AVCaptureVideoDataOutputSampleBufferDelegate {

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