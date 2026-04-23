import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import SpInAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  type AndroidInAppUpdateExtras,
  type StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

import { AppUpdateModal } from './AppUpdateModal';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';

type IosStoreLookup = {
  trackViewUrl?: string;
};

function iosAppStoreUrlFromEnv(): string | null {
  const id = env.IOS_APP_STORE_ID?.trim();
  if (!id) {
    return null;
  }
  return `https://apps.apple.com/app/id${id}`;
}

function isStoreUpdateCheckEnabledInDev(): boolean {
  const v = String(env.STORE_UPDATE_CHECK_IN_DEV ?? '').toLowerCase();
  return v === 'true' || v === '1';
}

/** Store update UI / checks are off in Metro unless `.env` enables dev override. */
function allowStoreUpdateFlow(): boolean {
  return !__DEV__ || isStoreUpdateCheckEnabledInDev();
}

/**
 * Android: Play in-app updates after the user taps Update.
 * iOS: App Store version check (Siren); opens the App Store product URL (no embedded install).
 */
export const StoreUpdatePrompt: React.FC = () => {
  const isLoading = useAuthStore(s => s.isLoading);
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const visibleRef = useRef(false);
  const clientRef = useRef<SpInAppUpdates | null>(null);
  const playExtrasRef = useRef<Pick<
    AndroidInAppUpdateExtras,
    'isImmediateUpdateAllowed' | 'isFlexibleUpdateAllowed'
  > | null>(null);
  const appStoreUrlRef = useRef<string | null>(null);
  const flexibleListenerRef = useRef<
    ((e: StatusUpdateEvent) => void) | null
  >(null);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const clearFlexibleListener = useCallback(() => {
    const client = clientRef.current;
    const fn = flexibleListenerRef.current;
    if (client && fn) {
      client.removeStatusUpdateListener(fn);
    }
    flexibleListenerRef.current = null;
  }, []);

  const runCheck = useCallback(async () => {
    if (!allowStoreUpdateFlow()) {
      return;
    }
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return;
    }
    if (visibleRef.current) {
      return;
    }

    try {
      const client = new SpInAppUpdates(false);
      const result = await client.checkNeedsUpdate({
        curVersion: DeviceInfo.getVersion(),
      });

      if (!result.shouldUpdate) {
        return;
      }

      if (Platform.OS === 'android') {
        const other = result.other as AndroidInAppUpdateExtras | undefined;
        playExtrasRef.current = other
          ? {
              isImmediateUpdateAllowed: !!other.isImmediateUpdateAllowed,
              isFlexibleUpdateAllowed: !!other.isFlexibleUpdateAllowed,
            }
          : null;
        appStoreUrlRef.current = null;
      } else {
        playExtrasRef.current = null;
        const other = result.other as IosStoreLookup | undefined;
        appStoreUrlRef.current =
          other?.trackViewUrl?.trim() || iosAppStoreUrlFromEnv();
        if (!appStoreUrlRef.current) {
          return;
        }
      }

      clientRef.current = client;
      setVisible(true);
    } catch {
      // Store / network unavailable — skip silently
    }
  }, []);

  useEffect(() => {
    if (isLoading || !allowStoreUpdateFlow()) {
      return;
    }
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return;
    }
    runCheck().catch(() => {});
  }, [isLoading, runCheck]);

  useEffect(() => {
    if (!allowStoreUpdateFlow()) {
      return;
    }
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return;
    }

    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && !isLoading) {
        runCheck().catch(() => {});
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [isLoading, runCheck]);

  const handleUpdatePress = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const url = appStoreUrlRef.current;
      if (!url) {
        return;
      }
      setUpdating(true);
      try {
        await Linking.openURL(url);
        setVisible(false);
      } catch {
        setVisible(true);
      } finally {
        setUpdating(false);
      }
      return;
    }

    const client = clientRef.current;
    if (!client) {
      return;
    }

    setUpdating(true);
    clearFlexibleListener();

    try {
      const flags = playExtrasRef.current;

      if (flags?.isImmediateUpdateAllowed) {
        setVisible(false);
        await client.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
        return;
      }

      if (flags?.isFlexibleUpdateAllowed) {
        const onStatus = (e: StatusUpdateEvent) => {
          if (e.status === IAUInstallStatus.DOWNLOADED) {
            clearFlexibleListener();
            client.installUpdate();
          }
        };
        flexibleListenerRef.current = onStatus;
        client.addStatusUpdateListener(onStatus);
        setVisible(false);
        await client.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
        return;
      }

      setVisible(false);
      await client.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
    } catch {
      setVisible(true);
    } finally {
      setUpdating(false);
    }
  }, [clearFlexibleListener]);

  useEffect(() => {
    return () => {
      clearFlexibleListener();
      clientRef.current = null;
    };
  }, [clearFlexibleListener]);

  if (!allowStoreUpdateFlow()) {
    return null;
  }
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return null;
  }

  return (
    <AppUpdateModal
      visible={visible}
      onUpdatePress={handleUpdatePress}
      loading={updating}
    />
  );
};
