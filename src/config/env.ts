import { API_BASE_URL, NODE_ENV, API_KEY, GOOGLE_CLIENT_ID } from '@env';

export const env = {
  API_BASE_URL: API_BASE_URL ,
  NODE_ENV: NODE_ENV,
  API_KEY: API_KEY || '',
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID || '',
};

