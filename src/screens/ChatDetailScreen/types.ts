export type ChatMessage =
  | {
      type: 'text';
      text: string;
      timestamp: string;
      sent: boolean;
      replyTo?: { senderName: string; preview: string };
      messageId?: string;
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
  | { type: 'image'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'file'; uri: string; name: string; timestamp: string; sent: boolean; messageId?: string };

export type PendingAttachment =
  | { type: 'image'; uri: string; name?: string; mimeType?: string }
  | { type: 'file'; uri: string; name: string };
