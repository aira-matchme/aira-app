export type ChatMessage =
  | {
      type: 'text';
      text: string;
      timestamp: string;
      sent: boolean;
      replyTo?: { senderName: string; preview: string };
      messageId?: string;
      /** Optimistic bubble waiting for send API confirmation. */
      sending?: boolean;
    }
  | {
      type: 'rich';
      blocks: Array<
        | { type: 'paragraph'; text: string }
        | {
            type: 'bullet_list';
            items: Array<{ title?: string; description?: string }>;
          }
      >;
      timestamp: string;
      sent: boolean;
      messageId?: string;
    }
  | { type: 'voice'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | {
      type: 'image';
      uri: string;
      timestamp: string;
      sent: boolean;
      messageId?: string;
      uploading?: boolean;
      uploadFailed?: boolean;
    }
  | {
      type: 'file';
      uri: string;
      name: string;
      timestamp: string;
      sent: boolean;
      messageId?: string;
      uploading?: boolean;
      uploadFailed?: boolean;
    }
  /** Persisted call row from API `messageType: system_call` + `contentBlocks[].type === call_log`. */
  | {
      type: 'call_log';
      callId: string;
      callType: 'audio' | 'video';
      callStatus: string;
      durationSec: number;
      /** Resolved copy: `textForCaller` / `textForReceiver` by role, or server `content` fallback. */
      label: string;
      /** When true, show `label` as one line from `textForCaller` / `textForReceiver`. Not used for `ENDED` (duration subtitle comes from `durationSec`). */
      displayAsSummaryLine?: boolean;
      timestamp: string;
      sent: boolean;
      messageId?: string;
    };

export type PendingAttachment =
  | { type: 'image'; uri: string; name?: string; mimeType?: string }
  | { type: 'file'; uri: string; name: string };
