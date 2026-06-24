const DEFAULT_SOCKET_URL = 'https://dev-socket.airamatchme.com';

/** Socket.IO client expects `http(s)://`, not `ws(s)://`. */
export function normalizeSocketIoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('wss://')) return `https://${trimmed.slice(6)}`.replace(/\/$/, '');
  if (trimmed.startsWith('ws://')) return `http://${trimmed.slice(5)}`.replace(/\/$/, '');
  return trimmed.replace(/\/$/, '');
}

/**
 * Resolve the Socket.IO server URL.
 * 1. Explicit `SOCKET_URL` from `.env` when set.
 * 2. Derive from `API_BASE_URL` (local same-origin, or `api` → `socket` host swap).
 * 3. Fall back to the shared dev socket host.
 */
export function resolveSocketUrl(
  apiBaseUrl: string | undefined,
  explicitSocketUrl?: string
): string {
  const explicit = explicitSocketUrl?.trim();
  if (explicit) {
    const normalized = normalizeSocketIoUrl(explicit);
    if (normalized) return normalized;
  }

  const api = apiBaseUrl?.trim();
  if (!api) return DEFAULT_SOCKET_URL;

  try {
    const parsed = new URL(api);
    const host = parsed.hostname;

    if (host.includes('dev-api')) {
      const socketHost = host.replace('dev-api', 'dev-socket');
      return normalizeSocketIoUrl(`${parsed.protocol}//${socketHost}`);
    }

    if (host.startsWith('api.')) {
      const socketHost = `socket.${host.slice('api.'.length)}`;
      return normalizeSocketIoUrl(`${parsed.protocol}//${socketHost}`);
    }

    // Local / custom backend — Socket.IO on the same host and port as REST.
    return normalizeSocketIoUrl(`${parsed.protocol}//${parsed.host}`);
  } catch {
    return DEFAULT_SOCKET_URL;
  }
}
