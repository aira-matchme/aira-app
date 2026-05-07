import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { DASHBOARD_WALKTHROUGH_STORAGE_KEY } from '../../constants/dashboardWalkthroughStorage';
import { useAuthStore } from '../../store/auth.store';

/** PATCH server + clear legacy local flag + update in-memory user (from profile field `isAppTourDone`). */
export async function markAppTourCompleted(): Promise<void> {
  await apiClient.patch(endpoints.auth.appTour, { isAppTourDone: true });
  try {
    await AsyncStorage.removeItem(DASHBOARD_WALKTHROUGH_STORAGE_KEY);
  } catch {
    // non-blocking
  }
  const { user, setUser } = useAuthStore.getState();
  if (user) {
    setUser({ ...user, isAppTourDone: true });
  }
}
