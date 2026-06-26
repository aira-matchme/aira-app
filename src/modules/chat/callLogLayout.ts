/** Shared call-log bubble layout (chat detail + list helpers). */

export type CallLogBubbleIcon =
  | 'videoOutgoing'
  | 'videoIncoming'
  | 'videoMissed'
  | 'voiceOutgoing'
  | 'voiceIncoming'
  | 'voiceMissed';

export type CallLogBubbleLayout = {
  title: string;
  subtitle: string;
  variant: 'sent' | 'received' | 'missed';
  icon: CallLogBubbleIcon;
};

export type CallLogBubbleInput = {
  callStatus: string;
  callType: 'audio' | 'video';
  durationSec: number;
  label: string;
  displayAsSummaryLine?: boolean;
  sent: boolean;
};

function formatCallDurationSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s} ${s === 1 ? 'sec' : 'secs'}`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (rem === 0) return `${m} ${m === 1 ? 'min' : 'mins'}`;
  return `${m} min ${rem} secs`;
}

function missedIcon(isVideo: boolean): CallLogBubbleIcon {
  return isVideo ? 'videoMissed' : 'voiceMissed';
}

function directionIcon(isVideo: boolean, sent: boolean): CallLogBubbleIcon {
  if (isVideo) return sent ? 'videoOutgoing' : 'videoIncoming';
  return sent ? 'voiceOutgoing' : 'voiceIncoming';
}

/** Parse a full server phrase like "Video Call Declined" into title + subtitle. */
function parseCompleteCallLabel(
  label: string,
  isVideo: boolean,
): CallLogBubbleLayout | null {
  const raw = label.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const callTitle = isVideo ? 'Video Call' : 'Voice Call';
  const missedTitle = isVideo ? 'Missed Video Call' : 'Missed Voice Call';

  if (lower.includes('missed') && (lower.includes('video') || lower.includes('voice'))) {
    return {
      title: missedTitle,
      subtitle: '',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }
  if (lower.includes('declined')) {
    return {
      title: callTitle,
      subtitle: 'Declined',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }
  if (lower.includes('no answer') || lower.includes('not answered') || lower.includes('unanswered')) {
    return {
      title: callTitle,
      subtitle: 'No answer',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }
  if (lower.includes('cancelled') || lower.includes('canceled')) {
    return {
      title: callTitle,
      subtitle: 'Cancelled',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return {
      title: missedTitle,
      subtitle: '',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }
  return null;
}

export function buildCallLogBubbleLayout(input: CallLogBubbleInput): CallLogBubbleLayout {
  const status = input.callStatus.toUpperCase();
  const isVideo = input.callType === 'video';
  const callTitle = isVideo ? 'Video Call' : 'Voice Call';
  const missedTitle = isVideo ? 'Missed Video Call' : 'Missed Voice Call';
  const summary = input.label.trim();

  if (input.displayAsSummaryLine === true && summary.length > 0) {
    const parsed = parseCompleteCallLabel(summary, isVideo);
    if (parsed) return parsed;
  }

  if (status === 'REJECTED' || status === 'DECLINED') {
    const parsed = parseCompleteCallLabel(summary, isVideo);
    if (parsed) return parsed;
    return {
      title: callTitle,
      subtitle: 'Declined',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }

  if (status === 'MISSED' || status === 'NO_ANSWER') {
    const parsed = parseCompleteCallLabel(summary, isVideo);
    return parsed ?? {
      title: missedTitle,
      subtitle: '',
      variant: 'missed',
      icon: missedIcon(isVideo),
    };
  }

  if (status === 'TIMEOUT' || status === 'TIMED_OUT') {
    return input.sent
      ? {
          title: callTitle,
          subtitle: 'No answer',
          variant: 'missed',
          icon: missedIcon(isVideo),
        }
      : {
          title: missedTitle,
          subtitle: '',
          variant: 'missed',
          icon: missedIcon(isVideo),
        };
  }

  if (status === 'CANCELLED' || status === 'CANCELED') {
    return input.sent
      ? {
          title: callTitle,
          subtitle: 'Cancelled',
          variant: 'missed',
          icon: missedIcon(isVideo),
        }
      : {
          title: missedTitle,
          subtitle: '',
          variant: 'missed',
          icon: missedIcon(isVideo),
        };
  }

  if (status === 'ENDED') {
    if (input.durationSec <= 0) {
      return {
        title: missedTitle,
        subtitle: '',
        variant: 'missed',
        icon: missedIcon(isVideo),
      };
    }
    return {
      title: callTitle,
      subtitle: formatCallDurationSec(input.durationSec),
      variant: input.sent ? 'sent' : 'received',
      icon: directionIcon(isVideo, input.sent),
    };
  }

  if (summary.length > 0) {
    const parsed = parseCompleteCallLabel(summary, isVideo);
    if (parsed) return parsed;
    return {
      title: summary,
      subtitle: '',
      variant: input.sent ? 'sent' : 'received',
      icon: directionIcon(isVideo, input.sent),
    };
  }

  return {
    title: isVideo ? 'Video call' : 'Voice call',
    subtitle: '',
    variant: input.sent ? 'sent' : 'received',
    icon: directionIcon(isVideo, input.sent),
  };
}

/** Only use API summary line when it is a complete phrase (declined / missed / etc.). */
export function shouldUseCallSummaryLine(callStatus: string, label: string): boolean {
  const status = callStatus.toUpperCase();
  if (status === 'ENDED') return false;
  const lower = label.trim().toLowerCase();
  return (
    lower.includes('declined') ||
    lower.includes('missed') ||
    lower.includes('cancelled') ||
    lower.includes('canceled') ||
    lower.includes('no answer') ||
    lower.includes('not answered') ||
    lower.includes('unanswered') ||
    lower.includes('timeout') ||
    lower.includes('timed out')
  );
}
