/**
 * App-wide registry for calls that have ended, been declined, cancelled, or timed out.
 * Shared across screens so stale incoming UI cannot accept a dead call.
 */
const terminatedCallIds = new Set<string>();
const listeners = new Set<(callId: string) => void>();

export function markCallTerminated(callId: string | null | undefined): void {
  const id = callId?.trim();
  if (!id || terminatedCallIds.has(id)) return;
  terminatedCallIds.add(id);
  listeners.forEach((listener) => listener(id));
}

export function clearCallTerminated(callId: string | null | undefined): void {
  const id = callId?.trim();
  if (!id) return;
  terminatedCallIds.delete(id);
}

export function isCallTerminated(callId: string | null | undefined): boolean {
  const id = callId?.trim();
  return Boolean(id && terminatedCallIds.has(id));
}

export function onCallTerminated(listener: (callId: string) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
