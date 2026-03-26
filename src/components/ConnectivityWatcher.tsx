import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { useApiErrorStore } from '../store/apiError.store';

function isDeviceOffline(state: NetInfoState): boolean {
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}

/**
 * Shows the global "no internet" sheet when the link goes down, and dismisses it
 * when we only had that sheet open and connectivity returns.
 */
export const ConnectivityWatcher = () => {
  const prevOfflineRef = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    NetInfo.fetch().then((state) => {
      if (cancelled) return;
      const offline = isDeviceOffline(state);
      prevOfflineRef.current = offline;
      if (offline) {
        useApiErrorStore.getState().showError(undefined, { variant: 'network' });
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = isDeviceOffline(state);
      const wasOffline = prevOfflineRef.current;

      if (offline && wasOffline !== true) {
        useApiErrorStore.getState().showError(undefined, { variant: 'network' });
      } else if (!offline && wasOffline === true) {
        const st = useApiErrorStore.getState();
        if (st.visible && st.variant === 'network') {
          st.hideError();
        }
      }

      prevOfflineRef.current = offline;
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
};

export default ConnectivityWatcher;
