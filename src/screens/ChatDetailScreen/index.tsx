import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { Button } from '../../components/Button';
import { ReusableBottomSheet } from '../../components/BottomSheet';
import {
  checkCameraPermission,
  requestCameraPermission,
  checkPhotoLibraryPermission,
  requestPhotoLibraryPermission,
} from '../../config/permissions';
import { BackArrowIcon } from '../../assets/icons/common/BackArrowIcon';
import { MoreVertIcon } from '../../assets/icons/common/MoreVertIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { PlusIcon } from '../../assets/icons/common/PlusIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { MicIcon } from '../../assets/icons/common/MicIcon';
import { PlayIcon } from '../../assets/icons/common/PlayIcon';
import { PauseIcon } from '../../assets/icons/common/PauseIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { ReplyIcon } from '../../assets/icons/common/ReplyIcon';
import { AskAiraIcon } from '../../assets/icons/common/AskAiraIcon';
import { CloseIcon } from '../../assets/icons/common/CloseIcon';
import { ActionSheetFileIcon } from '../../assets/icons/common/ActionSheetFileIcon';
import { AttachmentOptionsBottomSheet, type AttachmentOption } from '../../components/AttachmentOptionsBottomSheet';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../../constants/strings';
import { colors, typography } from '../../theme';
import type { ChatStackParamList } from '../../navigation/types';
import { styles, H_PADDING } from './styles';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

type ChatMessage =
  | { type: 'text'; text: string; timestamp: string; sent: boolean }
  | { type: 'voice'; timestamp: string; sent: boolean }
  | { type: 'image'; uri: string; timestamp: string; sent: boolean }
  | { type: 'file'; uri: string; name: string; timestamp: string; sent: boolean };

const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];

const now = () => {
  const d = new Date();
  return `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

export const ChatDetailScreen = ({ route, navigation }: Props) => {
  const { name, avatar } = route.params;
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'text', text: STRINGS.CHAT.SENT_MSG, timestamp: STRINGS.CHAT.TIME_8_12, sent: true },
    { type: 'text', text: STRINGS.CHAT.RECEIVED_MSG, timestamp: STRINGS.CHAT.TIME_8_13, sent: false },
    { type: 'voice', timestamp: STRINGS.CHAT.TIME_8_15, sent: true },
    { type: 'text', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,.', timestamp: STRINGS.CHAT.TIME_8_13, sent: false },
  ]);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ type: 'image'; uri: string } | { type: 'file'; uri: string; name: string }>>([]);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [voiceBarVisible, setVoiceBarVisible] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voicePaused, setVoicePaused] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [askAiraGenerating, setAskAiraGenerating] = useState(false);
  const [messageContextIndex, setMessageContextIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const getFileTypeLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'FILE';
  };

  const formatVoiceTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!voiceBarVisible || voicePaused) {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      return;
    }
    voiceTimerRef.current = setInterval(() => {
      setVoiceSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
    };
  }, [voiceBarVisible, voicePaused]);

  const handleMicPress = () => {
    if (inputText.trim() || pendingAttachments.length) return;
    setVoiceBarVisible(true);
    setVoiceSeconds(0);
    setVoicePaused(false);
  };

  const handleVoiceTrash = () => {
    setVoiceBarVisible(false);
    setVoiceSeconds(0);
    setVoicePaused(false);
  };

  const handleVoicePlayPause = () => {
    setVoicePaused((p) => !p);
  };

  const handleVoiceSend = () => {
    setMessages((prev) => [...prev, { type: 'voice', timestamp: now(), sent: true }]);
    setVoiceBarVisible(false);
    setVoiceSeconds(0);
    setVoicePaused(false);
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) setPendingAttachments((p) => [...p, { type: 'image', uri }]);
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) setPendingAttachments((p) => [...p, { type: 'image', uri }]);
      }
    );
  };

  const openFilePicker = async () => {
    try {
      const results = await pick({ allowMultiSelection: false });
      if (results?.length && results[0]) {
        const { uri, name: fileName } = results[0];
        setPendingAttachments((p) => [...p, { type: 'file', uri, name: fileName ?? 'File' }]);
      }
    } catch {
      // User cancelled or error
    }
  };

  const handleCamera = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkCameraPermission();
    if (status === 'granted') {
      openCamera();
      return;
    }
    setShowCameraPermissionSheet(true);
  };

  const handleAllowCameraPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestCameraPermission();
      setShowCameraPermissionSheet(false);
      if (status === 'granted') {
        openCamera();
      } else {
        Alert.alert(
          STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE,
          'Please enable camera access in Settings to send photos in chat.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
          ]
        );
      }
    } catch {
      setShowCameraPermissionSheet(false);
      Alert.alert('Error', 'Failed to request camera permission.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
      ]);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleGallery = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkPhotoLibraryPermission();
    const hasAccess = status === 'granted' || status === 'limited';
    if (hasAccess) {
      openGallery();
      return;
    }
    setShowGalleryPermissionSheet(true);
  };

  const handleAllowGalleryPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestPhotoLibraryPermission();
      setShowGalleryPermissionSheet(false);
      const hasAccess = status === 'granted' || status === 'limited';
      if (hasAccess) {
        openGallery();
      } else {
        Alert.alert(
          STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE,
          'Please enable photo access in Settings to send images in chat.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
          ]
        );
      }
    } catch {
      setShowGalleryPermissionSheet(false);
      Alert.alert('Error', 'Failed to request photo permission.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
      ]);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    const hasAttachments = pendingAttachments.length > 0;
    if (!trimmed && !hasAttachments) return;
    const newMessages: ChatMessage[] = [];
    if (trimmed) {
      newMessages.push({ type: 'text', text: trimmed, timestamp: now(), sent: true });
      setInputText('');
    }
    pendingAttachments.forEach((att) => {
      if (att.type === 'image') {
        newMessages.push({ type: 'image', uri: att.uri, timestamp: now(), sent: true });
      } else {
        newMessages.push({ type: 'file', uri: att.uri, name: att.name, timestamp: now(), sent: true });
      }
    });
    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
      if (hasAttachments) setPendingAttachments([]);
    }
  };

  const handleAttachmentSelect = (option: AttachmentOption) => {
    if (option === 'camera') {
      handleCamera();
      return;
    }
    if (option === 'gallery') {
      handleGallery();
      return;
    }
    if (option === 'files') {
      setAttachmentSheetOpen(false);
      openFilePicker();
    }
  };

  const handleMessageLongPress = (index: number) => {
    setMessageContextIndex(index);
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.type === 'text') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <TouchableOpacity
              style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent]}>{msg.text}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    if (msg.type === 'voice') {
      return (
        <React.Fragment key={index}>
          <View style={styles.messageRow}>
            <TouchableOpacity
              style={styles.voiceBubbleSent}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <TouchableOpacity style={styles.voiceBubblePlay} activeOpacity={0.8} onPress={() => {}}>
                <PlayIcon size={40} color={colors.white} variant="voiceBubble" />
              </TouchableOpacity>
              <View style={styles.voiceBubbleWaveform}>
                {VOICE_WAVEFORM.map((h, i) => (
                  <View key={i} style={[styles.voiceBubbleWaveformBar, { height: Math.max(6, h) }]} />
                ))}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    if (msg.type === 'image') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <TouchableOpacity
              style={[styles.imageBubble, msg.sent ? undefined : styles.imageBubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <Image source={{ uri: msg.uri }} style={styles.imageBubbleImage} resizeMode="cover" />
            </TouchableOpacity>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    if (msg.type === 'file') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <TouchableOpacity
              style={[styles.fileBubble, msg.sent ? undefined : styles.fileBubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <View style={styles.fileBubbleIcon}>
                <ActionSheetFileIcon size={24} color={msg.sent ? colors.white : colors.primary.purple} />
              </View>
              <Text style={[styles.fileBubbleName, msg.sent ? undefined : styles.fileBubbleNameReceived]} numberOfLines={1}>
                {msg.name}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor={colors.white}/>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackArrowIcon size={24} backgroundColor="transparent" strokeColor={colors.black} />
        </TouchableOpacity>
        {avatar != null ? (
          <Image source={avatar} style={styles.headerAvatar} resizeMode="cover" />
        ) : (
          <View style={styles.headerAvatar} />
        )}
        <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
        <TouchableOpacity style={styles.moreButton} onPress={() => setMoreMenuVisible(true)}>
          <MoreVertIcon size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={moreMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
          <View style={styles.moreMenuBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.moreMenu, { top: insets.top + 12 + 40 + 12 }]} collapsable={false}>
                <TouchableOpacity
                  style={styles.moreMenuItem}
                  onPress={() => {
                    setMoreMenuVisible(false);
                    // TODO: Block user
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.moreMenuIconWrap}>
                    <BlockIcon size={20} color={colors.black} />
                  </View>
                  <Text style={styles.moreMenuLabel}>Block</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moreMenuItem}
                  onPress={() => {
                    setMoreMenuVisible(false);
                    // TODO: Report
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.moreMenuIconWrap]}>
                    <ReportIcon size={20} color={colors.semantic.error} />
                  </View>
                  <Text style={styles.moreMenuLabelReport}>Report</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={messageContextIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageContextIndex(null)}
      >
        <TouchableWithoutFeedback onPress={() => setMessageContextIndex(null)}>
          <View style={styles.messageContextBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.messageContextBubble}>
                <TouchableOpacity
                  style={styles.messageContextItem}
                  onPress={() => {
                    setMessageContextIndex(null);
                    // TODO: focus input and quote/reply to message at messageContextIndex
                  }}
                  activeOpacity={0.7}
                >
                  <ReplyIcon size={20} color={colors.black} />
                  <Text style={styles.messageContextLabel}>{STRINGS.CHAT.REPLY}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.messageContextItemDelete}
                  onPress={() => {
                    if (messageContextIndex !== null) {
                      setDeleteConfirmIndex(messageContextIndex);
                      setMessageContextIndex(null);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <DeleteIcon size={20} color={colors.semantic.error} />
                  <Text style={styles.messageContextLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteConfirmIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteConfirmIndex(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteConfirmIndex(null)}>
          <View style={styles.deleteConfirmBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.deleteConfirmSheet}>
                <View style={styles.deleteConfirmHandle} />
                <Text style={styles.deleteConfirmTitle}>{STRINGS.CHAT.DELETE_MESSAGE_TITLE}</Text>
                <Text style={styles.deleteConfirmDescription}>{STRINGS.CHAT.DELETE_MESSAGE_DESCRIPTION}</Text>
                <TouchableOpacity
                  style={styles.deleteConfirmButtonDelete}
                  onPress={() => {
                    if (deleteConfirmIndex !== null) {
                      setMessages((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
                      setDeleteConfirmIndex(null);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteConfirmButtonLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteConfirmButtonCancel}
                  onPress={() => setDeleteConfirmIndex(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteConfirmButtonLabelCancel}>{STRINGS.CHAT.CANCEL}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.datePill}>
          <Text style={styles.datePillText}>{STRINGS.CHAT.TODAY}</Text>
        </View>
        {messages.map((msg, index) => renderMessage(msg, index))}
      </ScrollView>

      {voiceBarVisible ? (
        <View style={[styles.voiceBar, { paddingBottom: 12 + insets.bottom }]}>
          <TouchableOpacity style={styles.voiceBarTrash} onPress={handleVoiceTrash} activeOpacity={0.8}>
            <DeleteIcon size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.voiceBarPill}>
            <TouchableOpacity style={styles.voiceBarPlayPause} onPress={handleVoicePlayPause} activeOpacity={0.8}>
              {voicePaused ? (
                <PlayIcon size={24} color={colors.black} />
              ) : (
                <PauseIcon size={24} color={colors.black} />
              )}
            </TouchableOpacity>
            <View style={styles.voiceBarWaveform}>
              {VOICE_WAVEFORM.map((h, i) => (
                <View key={i} style={[styles.voiceBarWaveformBar, { height: Math.max(6, h) }]} />
              ))}
            </View>
            <Text style={styles.voiceBarTimer}>{formatVoiceTime(voiceSeconds)}</Text>
          </View>
          <TouchableOpacity style={styles.voiceBarSend} onPress={handleVoiceSend} activeOpacity={0.8}>
            <ForwardArrowIcon size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputArea}>
          {askAiraGenerating && (
            <View style={[styles.generatingBar, { paddingHorizontal: H_PADDING }]}>
              <View style={styles.generatingBubble}>
                <AskAiraIcon size={18} color={colors.primary.purple} />
                <MaskedView
                  maskElement={
                    <Text style={[styles.generatingBubbleText, styles.generatingBubbleTextMask]}>
                      {STRINGS.CHAT.GENERATING_REPLIES}
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#CB7BF5', '#7742F0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                </MaskedView>
              </View>
              <TouchableOpacity
                style={styles.generatingCancel}
                onPress={() => setAskAiraGenerating(false)}
                activeOpacity={0.8}
              >
                <CloseIcon size={22} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputBar, { paddingBottom: 12 + insets.bottom }]}>
            <View style={styles.inputWrap}>
            {pendingAttachments.length > 0 && (
              <View style={styles.attachmentsInsidePill}>
                {pendingAttachments.map((att, i) => (
                  <View key={i} style={styles.attachmentPreviewWrapper}>
                    <View style={att.type === 'image' ? styles.attachmentPreview : styles.attachmentPreviewFileCard}>
                      {att.type === 'image' ? (
                        <Image source={{ uri: att.uri }} style={styles.attachmentPreviewImage} resizeMode="cover" />
                      ) : (
                        <>
                          <Text style={styles.attachmentPreviewFileType}>{getFileTypeLabel(att.name)}</Text>
                          <Text style={styles.attachmentPreviewFileName} numberOfLines={2}>
                            {att.name}
                          </Text>
                        </>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.attachmentRemove}
                      onPress={() => setPendingAttachments((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachButton} activeOpacity={0.7} onPress={() => setAttachmentSheetOpen(true)}>
                <PlusIcon size={18} color={colors.black} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                placeholderTextColor={colors.neutral[600]}
                value={inputText}
                onChangeText={setInputText}
                multiline
                returnKeyType="default"
                cursorColor={colors.primary.purple}
                selectionColor={colors.primary[50]}
              />
              {!inputText.trim() && !askAiraGenerating && (
                <TouchableOpacity style={styles.askAiraChip} activeOpacity={0.8} onPress={() => setAskAiraGenerating(true)}>
                  <AskAiraIcon size={14} color={colors.primary.purple} />
                  <Text style={styles.askAiraChipText}>{STRINGS.CHAT.ASK_AIRA}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && !pendingAttachments.length && styles.sendButtonMic]}
            activeOpacity={0.8}
            onPress={
              inputText.trim() || pendingAttachments.length
                ? handleSend
                : handleMicPress
            }
          >
            {inputText.trim() || pendingAttachments.length ? (
              <ForwardArrowIcon size={22} color={colors.white} />
            ) : (
              <MicIcon size={24} color={colors.black} />
            )}
          </TouchableOpacity>
          </View>
        </View>
      )}

      <AttachmentOptionsBottomSheet
        isOpen={attachmentSheetOpen}
        onClose={() => setAttachmentSheetOpen(false)}
        onSelect={handleAttachmentSelect}
      />

      <ReusableBottomSheet
        isOpen={showCameraPermissionSheet}
        onClose={() => setShowCameraPermissionSheet(false)}
        snapPoints={['45%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowCameraPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => setShowGalleryPermissionSheet(false)}
        snapPoints={['45%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowGalleryPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>
    </KeyboardAvoidingView>
  );
};

const permissionSheetStyles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  allowButton: {
    width: '100%',
    height: 54,
  },
});
