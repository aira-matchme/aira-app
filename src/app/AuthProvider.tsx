import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import socketService from '../services/socket/socketService';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    }
    return () => {
      socketService.disconnect();
    };
  }, [accessToken]);

  // Once we know the logged-in user, notify socket service so it can emit join_success
  useEffect(() => {
    if (!accessToken || !user?.id) return;
    socketService.setCurrentUser(user.id);
  }, [accessToken, user?.id]);

  return <>{children}</>;
};

