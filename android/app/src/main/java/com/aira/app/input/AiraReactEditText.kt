package com.aira.app.input

import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import androidx.core.view.inputmethod.EditorInfoCompat
import androidx.core.view.inputmethod.InputConnectionCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.textinput.ReactEditText

class AiraReactEditText(context: ReactContext) : ReactEditText(context) {
  override fun onCreateInputConnection(outAttrs: EditorInfo): InputConnection? {
    val base = super.onCreateInputConnection(outAttrs) ?: return null
    EditorInfoCompat.setContentMimeTypes(outAttrs, arrayOf("image/*"))

    return InputConnectionCompat.createWrapper(base, outAttrs) { inputContentInfo, flags, _ ->
      try {
        if ((flags and InputConnectionCompat.INPUT_CONTENT_GRANT_READ_URI_PERMISSION) != 0) {
          inputContentInfo.requestPermission()
        }
      } catch (_: Throwable) {
      }

      val event = Arguments.createMap().apply {
        putString("uri", inputContentInfo.contentUri?.toString())
        putString("mimeType", inputContentInfo.description?.getMimeType(0))
      }

      (context as ReactContext)
        .getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(id, "topCommitContent", event)
      true
    }
  }
}
