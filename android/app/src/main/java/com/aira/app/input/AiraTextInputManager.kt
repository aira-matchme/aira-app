package com.aira.app.input

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.textinput.ReactTextInputManager

class AiraTextInputManager : ReactTextInputManager() {
  override fun getName(): String = "AiraAndroidTextInput"

  override fun createViewInstance(reactContext: ThemedReactContext): AiraReactEditText {
    return AiraReactEditText(reactContext)
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
    val base = super.getExportedCustomBubblingEventTypeConstants()
    val events: MutableMap<String, Any> = if (base != null) HashMap(base) else HashMap()
    events["topCommitContent"] =
      MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onCommitContent")
      )
    return events
  }
}
