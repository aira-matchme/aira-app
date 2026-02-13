import Foundation
import React

@objc(FaceDetectionViewManager)
class FaceDetectionViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return FaceDetectionView()
  }
}
