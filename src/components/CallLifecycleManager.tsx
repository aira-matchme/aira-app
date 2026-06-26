import { useEffect } from 'react';
import socketService, { type CallLifecyclePayload } from '../services/socket/socketService';
import { markCallTerminated } from '../services/call/callSessionRegistry';

/**
 * Marks calls as terminated on every lifecycle socket event, regardless of which screen is mounted.
 * ChatDetailScreen listens to the registry to dismiss incoming UI and block stale accepts.
 */
export const CallLifecycleManager = () => {
  useEffect(() => {
    const markFromPayload = (payload: CallLifecyclePayload) => {
      const callId = payload.callId?.trim();
      if (callId) markCallTerminated(callId);
    };

    const unsubEnded = socketService.on<CallLifecyclePayload>('call_ended', markFromPayload);
    const unsubRejected = socketService.on<CallLifecyclePayload>('call_rejected', markFromPayload);

    return () => {
      unsubEnded();
      unsubRejected();
    };
  }, []);

  return null;
};

export default CallLifecycleManager;
