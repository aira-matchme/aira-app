/**
 * Network utility functions
 * 
 * IMPORTANT: Configure your API_BASE_URL in .env file based on your setup:
 * 
 * For PHYSICAL DEVICE:
 *   API_BASE_URL=http://192.168.1.11:3001
 *   (Use your computer's actual IP address on the local network)
 * 
 * For ANDROID EMULATOR:
 *   API_BASE_URL=http://10.0.2.2:3001
 *   (Emulators use 10.0.2.2 to access the host machine)
 * 
 * For iOS SIMULATOR:
 *   API_BASE_URL=http://localhost:3001
 *   (iOS simulators can access localhost directly)
 */
export const getAdjustedApiUrl = (baseUrl: string): string => {
  // No auto-adjustment - use exactly what's configured in .env
  // This gives you full control over the URL based on your device type
  if (!baseUrl) {
    console.warn('⚠️ API_BASE_URL is not set in .env file');
    return baseUrl;
  }

  console.log('🌐 Using API Base URL:', baseUrl);
  return baseUrl;
};

