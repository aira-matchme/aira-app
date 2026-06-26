/** Chat list last-message row for voice / video calls (Figma 3629:22279). */

export type ChatListCallPreviewIcon =
  | 'videoMissed'
  | 'voiceMissed'
  | 'video'
  | 'voice';

export type ChatListCallPreview = {
  label: string;
  variant: 'missed' | 'default';
  callType: 'video' | 'voice';
  icon: ChatListCallPreviewIcon;
};

const MISSED_STATUSES = new Set([
  'REJECTED',
  'MISSED',
  'NO_ANSWER',
  'CANCELLED',
  'CANCELED',
  'DECLINED',
  'FAILED',
  'TIMEOUT',
  'TIMED_OUT',
]);

function firstNonEmptyString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}

function normalizeMessageType(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function toPreviewString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'text' in value) {
    return toPreviewString((value as { text?: unknown }).text);
  }
  return String(value);
}

function sentenceCaseCallLabel(text: string): string {
  const lower = text.trim().toLowerCase();
  if (lower.includes('missed') && lower.includes('video')) return 'Missed video call';
  if (lower.includes('missed') && lower.includes('voice')) return 'Missed voice call';
  if (lower.includes('declined') && lower.includes('video')) return 'Missed video call';
  if (lower.includes('declined') && lower.includes('voice')) return 'Missed voice call';
  if (lower.includes('no answer') && lower.includes('video')) return 'Missed video call';
  if (lower.includes('no answer') && lower.includes('voice')) return 'Missed voice call';
  if (lower.includes('video call')) {
    return lower.includes('missed') ? 'Missed video call' : 'Video call';
  }
  if (lower.includes('voice call')) {
    return lower.includes('missed') ? 'Missed voice call' : 'Voice call';
  }
  return text.trim();
}

export function parseCallPreviewFromText(preview: string): ChatListCallPreview | null {
  const lower = preview.trim().toLowerCase();
  if (!lower) return null;

  if (lower.includes('missed') && lower.includes('video')) {
    return {
      label: 'Missed video call',
      variant: 'missed',
      callType: 'video',
      icon: 'videoMissed',
    };
  }
  if (lower.includes('missed') && lower.includes('voice')) {
    return {
      label: 'Missed voice call',
      variant: 'missed',
      callType: 'voice',
      icon: 'voiceMissed',
    };
  }
  if (lower.includes('declined') && lower.includes('video')) {
    return {
      label: 'Missed video call',
      variant: 'missed',
      callType: 'video',
      icon: 'videoMissed',
    };
  }
  if (lower.includes('declined') && lower.includes('voice')) {
    return {
      label: 'Missed voice call',
      variant: 'missed',
      callType: 'voice',
      icon: 'voiceMissed',
    };
  }
  if (lower.includes('no answer') && lower.includes('video')) {
    return {
      label: 'Missed video call',
      variant: 'missed',
      callType: 'video',
      icon: 'videoMissed',
    };
  }
  if (lower.includes('no answer') && lower.includes('voice')) {
    return {
      label: 'Missed voice call',
      variant: 'missed',
      callType: 'voice',
      icon: 'voiceMissed',
    };
  }
  if (lower.includes('video call')) {
    return {
      label: 'Video call',
      variant: 'default',
      callType: 'video',
      icon: 'video',
    };
  }
  if (lower.includes('voice call')) {
    return {
      label: 'Voice call',
      variant: 'default',
      callType: 'voice',
      icon: 'voice',
    };
  }
  return null;
}

/** Parse `lastMessage` from chat list API into a call preview row when applicable. */
export function resolveChatListCallPreview(lastMsg: unknown): ChatListCallPreview | null {
  if (!lastMsg || typeof lastMsg !== 'object') return null;

  const raw = lastMsg as Record<string, unknown>;
  const messageType = normalizeMessageType(raw.messageType ?? raw.type);

  if (messageType === 'system_call') {
    const blocks = raw.contentBlocks;
    if (Array.isArray(blocks)) {
      const log = blocks.find(
        (b) => b && typeof b === 'object' && (b as { type?: unknown }).type === 'call_log',
      );
      if (log && typeof log === 'object') {
        const b = log as Record<string, unknown>;
        const ct = String(b.callType ?? 'audio').toLowerCase();
        const isVideo = ct.includes('video');
        const status = String(b.callStatus ?? '').toUpperCase();
        const labelLower = (textLabel ?? '').toLowerCase();
        const isMissed =
          MISSED_STATUSES.has(status) ||
          labelLower.includes('declined') ||
          labelLower.includes('missed') ||
          labelLower.includes('no answer') ||
          labelLower.includes('not answered') ||
          labelLower.includes('cancelled') ||
          labelLower.includes('canceled') ||
          labelLower.includes('timeout') ||
          labelLower.includes('timed out');

        const textLabel = firstNonEmptyString(
          b.textForReceiver,
          b.text_for_receiver,
          b.textForCaller,
          b.text_for_caller,
          typeof raw.content === 'string' ? raw.content : undefined,
        );

        const defaultLabel = isMissed
          ? isVideo
            ? 'Missed video call'
            : 'Missed voice call'
          : isVideo
            ? 'Video call'
            : 'Voice call';

        return {
          label: textLabel ? sentenceCaseCallLabel(textLabel) : defaultLabel,
          variant: isMissed ? 'missed' : 'default',
          callType: isVideo ? 'video' : 'voice',
          icon: isMissed
            ? isVideo
              ? 'videoMissed'
              : 'voiceMissed'
            : isVideo
              ? 'video'
              : 'voice',
        };
      }
    }
  }

  const previewSource = raw.content ?? (lastMsg as { text?: unknown }).text;
  const preview = toPreviewString(previewSource);
  return parseCallPreviewFromText(preview);
}
