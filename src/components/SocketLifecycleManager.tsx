import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import socketService from '../services/socket/socketService';

/**
 * Restores socket presence + chat room joins when the app returns from background
 * or screen lock (JS may suspend while locked and drop the transport).
 */
export const SocketLifecycleManager = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const resumeSocket = () => {
      if (!accessToken) return;
      socketService.ensureConnected();
      if (userId) {
        socketService.setCurrentUser(userId);
      }
      socketService.rejoinTrackedChats();
    };

    const handleAppState = (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const wasBackground = prev === 'background' || prev === 'inactive';
      if (next === 'active' && wasBackground) {
        resumeSocket();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [accessToken, userId]);

  return null;
};

export default SocketLifecycleManager;
