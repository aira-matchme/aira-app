package com.aira;

/**
 * Shim BuildConfig so that generated ReactNativeApplicationEntryPoint,
 * which still references com.aira.BuildConfig, can compile while the
 * real application ID/namespace is com.aira.app.
 *
 * All flags are delegated to the actual app BuildConfig.
 */
public final class BuildConfig {
  private BuildConfig() {}

  public static final boolean IS_NEW_ARCHITECTURE_ENABLED =
      com.aira.app.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;

  public static final boolean IS_EDGE_TO_EDGE_ENABLED =
      com.aira.app.BuildConfig.IS_EDGE_TO_EDGE_ENABLED;
}


