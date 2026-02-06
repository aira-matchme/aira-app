import axios from 'axios';
import { appConfig } from '../../config/app.config';

console.log('🌐 API Client: Initializing with baseURL:', appConfig.apiBaseUrl);

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 30000, // Increased timeout for network issues
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🌐 API Client: Created with config:', {
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
});
