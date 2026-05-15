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
    return baseUrl;
  }
  return baseUrl;
};

/**
 * Resolves the Socket.IO client URL for the current build.
 *
 * - If `SOCKET_URL` is set in `.env`, it is used (scheme optional; host-only defaults to `wss://`).
 * - Otherwise derives from `apiBaseUrl`: same host, `https`→`wss`, `http`→`ws`, path/search stripped.
 *
 * Use an explicit `SOCKET_URL` when the socket runs on a different host than the REST API
 * (e.g. `wss://prod-socket.example.com` while API is `https://api.example.com`).
 */
export function getSocketIoUrl(apiBaseUrl: string, explicitSocketUrl?: string): string {
  const fromEnv = (explicitSocketUrl ?? '').trim();
  if (fromEnv) {
    if (/^(https?|wss?|ws):\/\//i.test(fromEnv)) {
      return fromEnv;
    }
    return `wss://${fromEnv}`;
  }

  const api = (apiBaseUrl ?? '').trim();
  if (!api) {
    return '';
  }

  try {
    const parsed = new URL(api);
    if (parsed.protocol === 'https:') {
      parsed.protocol = 'wss:';
    } else if (parsed.protocol === 'http:') {
      parsed.protocol = 'ws:';
    }
    parsed.pathname = '';
    parsed.search = '';
    parsed.hash = '';
    let out = parsed.toString();
    if (out.endsWith('/')) {
      out = out.slice(0, -1);
    }
    return out;
  } catch {
    return '';
  }
}

