import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, typography } from '../../../theme';
import { styles as chatStyles } from '../styles';

type ChatBubbleImageProps = {
  uri: string;
  width: number;
  height: number;
  sent: boolean;
  isUploading: boolean;
  uploadFailed: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export const ChatBubbleImage: React.FC<ChatBubbleImageProps> = ({
  uri,
  width,
  height,
  sent,
  isUploading,
  uploadFailed,
  onPress,
  onLongPress,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setLoadFailed(false);
  }, [uri]);

  const showLoadSkeleton = !loaded && !loadFailed && !isUploading;

  return (
    <TouchableOpacity
      style={[
        chatStyles.imageBubble,
        sent ? undefined : chatStyles.imageBubbleReceived,
        { width, height },
      ]}
      activeOpacity={1}
      disabled={isUploading}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {showLoadSkeleton ? (
        <View style={localStyles.loadSkeleton}>
          <ActivityIndicator size="small" color={colors.neutral[400]} />
        </View>
      ) : null}
      <Image
        source={{ uri }}
        style={chatStyles.imageBubbleImage}
        resizeMode="cover"
        blurRadius={isUploading ? 14 : 0}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoadFailed(true);
          setLoaded(true);
        }}
      />
      {isUploading ? (
        <View style={chatStyles.messageUploadOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      ) : null}
      {uploadFailed ? (
        <View style={chatStyles.messageUploadOverlay}>
          <Text style={chatStyles.messageUploadFailedText}>Failed to send</Text>
        </View>
      ) : null}
      {loadFailed && !uploadFailed && !isUploading ? (
        <View style={localStyles.loadErrorOverlay}>
          <Text style={localStyles.loadErrorText}>Could not load image</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  loadSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  loadErrorText: {
    ...typography.bodyMedium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
