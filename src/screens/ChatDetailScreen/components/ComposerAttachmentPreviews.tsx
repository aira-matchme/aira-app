import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { styles } from '../styles';
import type { PendingAttachment } from '../types';

/** Max thumbnails shown before "+N" overflow tile (Figma 2652-23137). */
export const COMPOSER_ATTACHMENT_PREVIEW_MAX = 3;

function getFileTypeLabel(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE';
  return ext.length <= 4 ? ext : 'FILE';
}

type Props = {
  attachments: PendingAttachment[];
  sendLoading: boolean;
  onRemove: (index: number) => void;
};

/** Single-row composer strip: up to 3 previews + "+N" overflow count. */
export const ComposerAttachmentPreviews: React.FC<Props> = ({
  attachments,
  sendLoading,
  onRemove,
}) => {
  if (attachments.length === 0) return null;

  const visible = attachments.slice(0, COMPOSER_ATTACHMENT_PREVIEW_MAX);
  const overflowCount = attachments.length - COMPOSER_ATTACHMENT_PREVIEW_MAX;

  return (
    <View style={styles.attachmentsInsidePill}>
      {visible.map((att, index) => (
        <View key={`${att.uri}-${index}`} style={styles.attachmentPreviewWrapper}>
          <View
            style={
              att.type === 'image'
                ? styles.attachmentPreview
                : styles.attachmentPreviewFileCard
            }
          >
            {att.type === 'image' ? (
              <Image
                source={{ uri: att.uri }}
                style={styles.attachmentPreviewImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <Text style={styles.attachmentPreviewFileType} numberOfLines={1}>
                  {getFileTypeLabel(att.name)}
                </Text>
                <Text style={styles.attachmentPreviewFileName} numberOfLines={2}>
                  {att.name}
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.attachmentRemove}
            disabled={sendLoading}
            onPress={() => onRemove(index)}
            accessibilityRole="button"
            accessibilityLabel="Remove attachment"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.attachmentRemoveLabel}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {overflowCount > 0 ? (
        <View
          style={styles.attachmentOverflowTile}
          accessibilityLabel={`${overflowCount} more attachments`}
        >
          <Text style={styles.attachmentOverflowText}>+{overflowCount}</Text>
        </View>
      ) : null}
    </View>
  );
};
