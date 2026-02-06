import { useEffect } from 'react';
import { setupInterceptors } from '@services/api/interceptors';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setupInterceptors();
  }, []);

  return <>{children}</>;
};
