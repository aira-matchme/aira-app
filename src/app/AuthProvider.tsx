import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useMe } from '../modules/auth/hooks';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, setUser, setLoading, logout, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const hasToken = !!accessToken;
  const shouldFetchProfile = hasToken && isInitialized;
  
  console.log('🔍 AuthProvider: Render state', {
    hasToken,
    isInitialized,
    shouldFetchProfile,
    accessToken: accessToken ? '***' : null,
  });
  
  const { data, error, isLoading: isFetchingProfile } = useMe(shouldFetchProfile);

  // Initialize auth state on mount (load tokens from storage)
  useEffect(() => {
    const init = async () => {
      console.log('🔄 AuthProvider: Initializing...');
      await initialize();
      console.log('✅ AuthProvider: Initialization complete');
      setIsInitialized(true);
    };
    init();
  }, [initialize]);

  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) {
      console.log('⏳ AuthProvider: Waiting for initialization...');
      return;
    }

    console.log('🔍 AuthProvider: Checking auth state', {
      hasToken,
      isFetchingProfile,
      hasData: !!data,
      hasError: !!error,
    });

    if (!hasToken) {
      // No token, user is not authenticated
      console.log('❌ AuthProvider: No token, user not authenticated');
      setLoading(false);
      return;
    }

    // We have a token, check if profile is being fetched
    if (isFetchingProfile) {
      console.log('⏳ AuthProvider: Fetching profile...');
      setLoading(true);
      return;
    }

    // Profile fetch completed
    if (data?.data) {
      // Successfully fetched profile, set user data
      console.log('✅ AuthProvider: Profile fetched successfully');
      setUser(data.data);
      setLoading(false);
    } else if (error) {
      // Profile fetch failed (e.g., token expired), logout
      console.log('❌ AuthProvider: Profile fetch failed, logging out:', error);
      logout();
      setLoading(false);
    } else {
      // Profile query completed but no data and no error
      // This shouldn't happen, but set loading to false to prevent stuck state
      console.log('⚠️ AuthProvider: Profile query completed but no data/error');
      setLoading(false);
    }
  }, [isInitialized, hasToken, data, error, isFetchingProfile, setUser, setLoading, logout]);

  return <>{children}</>;
};

