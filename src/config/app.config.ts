import { env } from './env';
import { getAdjustedApiUrl } from '../utils/network';

export const appConfig = {
  apiBaseUrl: getAdjustedApiUrl(env.API_BASE_URL || ''),
  appName: 'OneApp',
  version: '1.0.0',
};

