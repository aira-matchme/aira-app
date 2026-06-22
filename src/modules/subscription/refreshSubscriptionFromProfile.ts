import { getProfileApi } from '../auth/api';
import { useSubscriptionStore } from '../../store/subscription.store';

/** Re-fetch GET /auth/profile and sync subscription access flags. */
export async function refreshSubscriptionFromProfile() {
  const response = await getProfileApi();
  if (response?.data) {
    useSubscriptionStore.getState().syncFromProfile(response.data as Record<string, unknown>);
    return response.data;
  }
  return null;
}
