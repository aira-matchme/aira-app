import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../theme';
import { styles } from '../styles';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { VoiceControlEndIcon } from '../../../assets/icons/common/VoiceControlEndIcon';
import { VoiceControlSpeakerIcon } from '../../../assets/icons/common/VoiceControlSpeakerIcon';
import { VoiceControlVideoOffIcon } from '../../../assets/icons/common/VoiceControlVideoOffIcon';
import { VoiceControlMicIcon } from '../../../assets/icons/common/VoiceControlMicIcon';
import { VoiceControlMicOffIcon } from '../../../assets/icons/common/VoiceControlMicOffIcon';
import { VoiceControlMessageIcon } from '../../../assets/icons/common/VoiceControlMessageIcon';
import { AudioBluetoothIcon } from '../../../assets/icons/common/AudioBluetoothIcon';
import { AudioEarpieceIcon } from '../../../assets/icons/common/AudioEarpieceIcon';
import { AudioOptionCheckIcon } from '../../../assets/icons/common/AudioOptionCheckIcon';
import { CameraFlipIcon } from '../../../assets/icons/common/CameraFlipIcon';
import { CallVideoIncomingIcon } from '../../../assets/icons/common/CallVideoIncomingIcon';
import { CallVideoMissedIcon } from '../../../assets/icons/common/CallVideoMissedIcon';
import { CallVideoOutgoingIcon } from '../../../assets/icons/common/CallVideoOutgoingIcon';

import type { ActiveCallMode, AudioDevice } from '../hooks/useCallState';

// Figma MCP assets — replace with bundled assets when they expire
const INCOMING_CALL_VIDEO_BADGE_ICON = {
  uri: 'https://www.figma.com/api/mcp/asset/0a37e746-e5f5-4ee3-a5c9-324da371c8c7',
};
const INCOMING_CALL_VIDEO_ACCEPT_ICON = {
  uri: 'https://www.figma.com/api/mcp/asset/89d6ce01-2f86-4db1-8392-3e33106e0684',
};
const INCOMING_CALL_VIDEO_DECLINE_ICON = {
  uri: 'https://www.figma.com/api/mcp/asset/a8735b4f-d963-4b30-a427-4c11913733fd',
};

export interface CallOverlayProps {
  // ── visibility state ──
  callStateVisible: boolean;
  incomingVoiceCallVisible: boolean;
  incomingVideoCallVisible: boolean;
  incomingCallBannerVisible: boolean;
  incomingCallBannerMode: ActiveCallMode;
  // ── call mode / controls ──
  activeCallMode: ActiveCallMode;
  callAudioEnabled: boolean;
  callVideoEnabled: boolean;
  partnerAudioEnabled: boolean;
  partnerVideoEnabled: boolean;
  videoCallUiHidden: boolean;
  isOutgoingVoiceRinging: boolean;
  isSwitchingVoiceToVideo: boolean;
  switchToVideoPopupVisible: boolean;
  incomingCallSwitchRequestVisible: boolean;
  audioDeviceSheetVisible: boolean;
  selectedAudioDevice: AudioDevice;
  audioRouteFabHighlighted: boolean;
  isPartnerFullyOff: boolean;
  showPartnerMicOffState: boolean;
  showVideoPreviewOffSurface: boolean;
  showRemoteRtcVideo: boolean;
  // ── caller names ──
  incomingVoiceCallerName: string;
  incomingVideoCallerName: string;
  name: string;
  // ── call connected timestamp (timer computed here) ──
  callConnectedAtMs: number | null;
  // ── Agora / video ──
  localRtcUid: number;
  remoteRtcUid: number | null;
  AgoraRtcSurfaceView: React.ComponentType<any> | null;
  incomingVoiceSwipeY: Animated.Value;
  incomingVoiceAcceptPanResponder: { panHandlers: object };
  incomingVideoSwipeY: Animated.Value;
  incomingVideoAcceptPanResponder: { panHandlers: object };
  partnerDisplaySource: ImageSourcePropType;
  localVideoPreviewFallback: ImageSourcePropType;
  // ── handlers ──
  closeCallState: () => void;
  minimizeCallState: () => void;
  toggleCallAudio: () => void;
  toggleCallVideo: () => void;
  openAudioDeviceSheet: () => void;
  selectAudioDevice: (device: AudioDevice) => void;
  flipVideoCallCamera: () => void;
  toggleVideoCallUiHidden: () => void;
  openIncomingCallFromBanner: () => void;
  acceptIncomingVoiceCall: () => void;
  declineIncomingVoiceCall: () => void;
  acceptIncomingVideoCall: () => void;
  declineIncomingVideoCall: () => void;
  dismissIncomingVoiceCallModal: () => void;
  dismissIncomingVideoCallModal: () => void;
  requestSwitchVoiceToVideo: () => void;
  openSwitchToVideoPopup: () => void;
  respondToIncomingCallSwitchRequest: (accepted: boolean) => void;
  cancelSwitchToVideoRequest: () => void;
}

export const CallOverlay = React.memo(function CallOverlay(props: CallOverlayProps) {
  const {
    callStateVisible, incomingVoiceCallVisible, incomingVideoCallVisible,
    incomingCallBannerVisible, incomingCallBannerMode,
    activeCallMode, callAudioEnabled, callVideoEnabled,
    partnerAudioEnabled, partnerVideoEnabled, videoCallUiHidden,
    isOutgoingVoiceRinging, isSwitchingVoiceToVideo,
    switchToVideoPopupVisible, incomingCallSwitchRequestVisible,
    audioDeviceSheetVisible, selectedAudioDevice, audioRouteFabHighlighted,
    isPartnerFullyOff, showPartnerMicOffState, showVideoPreviewOffSurface, showRemoteRtcVideo,
    incomingVoiceCallerName, incomingVideoCallerName, name,
    callConnectedAtMs, localRtcUid, remoteRtcUid, AgoraRtcSurfaceView,
    incomingVoiceSwipeY, incomingVoiceAcceptPanResponder,
    incomingVideoSwipeY, incomingVideoAcceptPanResponder,
    partnerDisplaySource, localVideoPreviewFallback,
    closeCallState, minimizeCallState, toggleCallAudio, toggleCallVideo,
    openAudioDeviceSheet, selectAudioDevice, flipVideoCallCamera, toggleVideoCallUiHidden,
    openIncomingCallFromBanner, acceptIncomingVoiceCall, declineIncomingVoiceCall,
    acceptIncomingVideoCall, declineIncomingVideoCall, dismissIncomingVoiceCallModal,
    dismissIncomingVideoCallModal, requestSwitchVoiceToVideo,
    respondToIncomingCallSwitchRequest, cancelSwitchToVideoRequest,
  } = props;

  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // ─── Call timer lives HERE so only CallOverlay re-renders every second ──────
  const [callDurationSec, setCallDurationSec] = useState(0);

  useEffect(() => {
    if (!callStateVisible || !callConnectedAtMs || isOutgoingVoiceRinging) {
      setCallDurationSec(0);
      return;
    }
    const tick = () => setCallDurationSec(Math.max(0, Math.floor((Date.now() - callConnectedAtMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [callStateVisible, callConnectedAtMs, isOutgoingVoiceRinging]);

  const callDurationLabel = `${String(Math.floor(callDurationSec / 60)).padStart(2, '0')}:${String(callDurationSec % 60).padStart(2, '0')}`;
  const pickedVoiceDurationLabel = `${Math.floor(callDurationSec / 60)}:${String(callDurationSec % 60).padStart(2, '0')}`;

  // ─── Layout values (computed locally, not from parent) ─────────────────────
  const videoControlsApproxHeight = Math.round((68 / 812) * windowHeight);
  const videoBottomChromeOffset = Math.max(10, Math.round((28 / 812) * windowHeight));
  const videoPipGapAboveControls = Math.round((16 / 812) * windowHeight);
  const videoPipBottom = videoBottomChromeOffset + videoControlsApproxHeight + videoPipGapAboveControls;
  const videoPipBottomWhenUiHidden = Math.max(12, Math.round((20 / 812) * windowHeight));
  const videoAudioPopoverLeft = Math.max(16, Math.round((71 / 375) * windowWidth));
  const videoAudioPopoverBottom = videoBottomChromeOffset + videoControlsApproxHeight + 10;
  const videoPipWidth = Math.round((127 / 375) * windowWidth);
  const videoPipHeight = Math.round((200 / 812) * windowHeight);
  const videoPipRight = Math.max(12, Math.round((16 / 375) * windowWidth));
  const videoPipFlipInsetX = Math.max(10, Math.round((16 / 375) * windowWidth));
  const videoPipFlipInsetY = Math.max(10, Math.round((16 / 812) * windowHeight));
  const incomingVoiceActionsBottomInset = Math.max(22, insets.bottom + 8);
  const incomingVoiceCenterBottomInset = Math.max(34, Math.min(62, Math.round((46 * windowHeight) / 812)));

  // ─── Audio device popover (shared between voice and video call screens) ────
  const renderAudioDevicePopoverOptions = () => (
    <View style={styles.callStateAudioDevicePopoverList}>
      {(['bluetooth', 'speaker', 'earpiece'] as AudioDevice[]).map((device) => {
        const isSelected = selectedAudioDevice === device;
        return (
          <TouchableOpacity
            key={device}
            style={[styles.callStateAudioDeviceOption, isSelected && styles.callStateAudioDeviceOptionActive]}
            activeOpacity={0.8}
            onPress={() => selectAudioDevice(device)}
          >
            <View style={styles.callStateAudioDeviceOptionLeft}>
              {device === 'bluetooth' ? (
                <AudioBluetoothIcon size={20} color={isSelected ? colors.primary.purple : colors.neutral[600]} />
              ) : device === 'speaker' ? (
                <VoiceControlSpeakerIcon size={20} color={isSelected ? colors.primary.purple : colors.neutral[600]} />
              ) : (
                <AudioEarpieceIcon size={20} color={isSelected ? colors.primary.purple : colors.neutral[600]} />
              )}
              <Text style={[styles.callStateAudioDeviceOptionText, isSelected && styles.callStateAudioDeviceOptionTextActive]}>
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </Text>
            </View>
            {isSelected && <AudioOptionCheckIcon size={16} color={colors.primary.purple} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <>
      {/* ── Incoming call banner (top of chat screen) ─────────────────── */}
      {incomingCallBannerVisible ? (
        <View style={styles.incomingCallBannerWrap}>
          <TouchableOpacity
            style={styles.incomingCallBanner}
            activeOpacity={0.9}
            onPress={openIncomingCallFromBanner}
            accessibilityRole="button"
            accessibilityLabel="Incoming call notification"
          >
            <View style={styles.incomingCallBannerHeaderRow}>
              <View style={styles.incomingCallBannerAvatarWrap}>
                <Image source={partnerDisplaySource} style={styles.incomingCallBannerAvatar} resizeMode="cover" />
                <View style={styles.incomingCallBannerAvatarBadge}>
                  <Image source={INCOMING_CALL_VIDEO_BADGE_ICON} style={styles.incomingCallBannerAvatarBadgeIcon} resizeMode="contain" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomingCallBannerTitle} numberOfLines={1}>
                  {incomingCallBannerMode === 'voice' ? incomingVoiceCallerName || 'Incoming call' : incomingVideoCallerName || 'Incoming call'}
                </Text>
                <Text style={styles.incomingCallBannerSubtitle} numberOfLines={1}>
                  {incomingCallBannerMode === 'voice' ? 'Incoming voice call' : 'Incoming video call'}
                </Text>
              </View>
            </View>
            <View style={styles.incomingCallBannerButtonsRow}>
              <TouchableOpacity
                onPress={incomingCallBannerMode === 'voice' ? declineIncomingVoiceCall : declineIncomingVideoCall}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Decline incoming call"
                style={[styles.incomingCallBannerButtonPill, styles.incomingCallBannerDeclineButton]}
              >
                <View style={styles.incomingCallBannerButtonPillInner}>
                  <Image source={INCOMING_CALL_VIDEO_DECLINE_ICON} style={styles.incomingCallBannerPillIcon} resizeMode="contain" />
                  <Text style={styles.incomingCallBannerPillText}>Decline</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={incomingCallBannerMode === 'voice' ? acceptIncomingVoiceCall : acceptIncomingVideoCall}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Accept incoming call"
                style={[styles.incomingCallBannerButtonPill, styles.incomingCallBannerAcceptButton]}
              >
                <View style={styles.incomingCallBannerButtonPillInner}>
                  <Image source={INCOMING_CALL_VIDEO_ACCEPT_ICON} style={styles.incomingCallBannerPillIcon} resizeMode="contain" />
                  <Text style={styles.incomingCallBannerPillText}>Accept</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Incoming voice call full-screen modal ─────────────────────── */}
      <Modal visible={incomingVoiceCallVisible} animationType="fade" transparent={false} onRequestClose={declineIncomingVoiceCall}>
        <SafeAreaView style={styles.incomingVoiceBackdrop} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <View style={[styles.incomingVoiceCenterWrap, { paddingBottom: incomingVoiceCenterBottomInset }]}>
            <Image source={partnerDisplaySource} style={styles.incomingVoiceAvatar} resizeMode="cover" />
            <Text style={styles.incomingVoiceTitle}>Incoming voice call...</Text>
          </View>
          <View style={[styles.incomingVoiceActionsRow, { marginBottom: incomingVoiceActionsBottomInset }]}>
            <View style={styles.incomingVoiceActionGroupSmall}>
              <TouchableOpacity style={[styles.incomingVoiceActionCircle, styles.incomingVoiceDeclineBtn]} activeOpacity={0.8} onPress={declineIncomingVoiceCall} accessibilityRole="button" accessibilityLabel="Decline incoming call">
                <VoiceControlEndIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVoiceActionLabel}>Decline</Text>
            </View>
            <View style={styles.incomingVoiceActionGroupCenter}>
              <View style={styles.incomingVoiceSwipeIndicator}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Text key={`iv-chevron-${i}`} style={[styles.incomingVoiceSwipeChevron, { opacity: 0.28 + i * 0.14 }]}>˄</Text>
                ))}
              </View>
              <Animated.View style={{ transform: [{ translateY: incomingVoiceSwipeY }] }} {...(incomingVoiceAcceptPanResponder as any).panHandlers}>
                <TouchableOpacity style={[styles.incomingVoiceActionCircle, styles.incomingVoiceAcceptBtn]} activeOpacity={1} accessibilityRole="button" accessibilityLabel="Swipe up to accept incoming call">
                  <VoiceControlMicIcon size={24} color={colors.white} />
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.incomingVoiceActionLabel}>Swipe up to accept</Text>
            </View>
            <View style={styles.incomingVoiceActionGroupSmall}>
              <TouchableOpacity style={[styles.incomingVoiceActionCircle, styles.incomingVoiceMessageBtn]} activeOpacity={0.8} onPress={dismissIncomingVoiceCallModal} accessibilityRole="button" accessibilityLabel="Message caller">
                <VoiceControlMessageIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVoiceActionLabel}>Message</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Incoming video call full-screen modal ─────────────────────── */}
      <Modal visible={incomingVideoCallVisible} animationType="fade" transparent={false} onRequestClose={declineIncomingVideoCall}>
        <SafeAreaView style={styles.incomingVideoFullBackdrop} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <Image source={partnerDisplaySource} style={styles.incomingVideoFullBgImage} resizeMode="cover" />
          <View style={styles.incomingVideoFullOverlay} />
          <View style={styles.incomingVideoFullTopCenter}>
            <Text style={styles.incomingVideoFullName} numberOfLines={1}>{incomingVideoCallerName || name}</Text>
            <View style={styles.incomingVideoFullVideoTogglePill}>
              <CallVideoMissedIcon size={16} color={colors.white} />
              <Text style={styles.incomingVideoFullVideoToggleText}>Turn off your video</Text>
            </View>
          </View>
          <View style={[styles.incomingVideoFullActionsRow, { marginBottom: incomingVoiceActionsBottomInset }]}>
            <View style={styles.incomingVideoFullActionGroupSmall}>
              <TouchableOpacity style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullDeclineBtn]} activeOpacity={0.8} onPress={declineIncomingVideoCall} accessibilityRole="button" accessibilityLabel="Decline incoming video call">
                <VoiceControlEndIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVideoFullActionLabel}>Decline</Text>
            </View>
            <View style={styles.incomingVideoFullActionGroupCenter}>
              <View style={styles.incomingVideoFullSwipeIndicator}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Text key={`ivideo-chevron-${i}`} style={[styles.incomingVideoFullSwipeChevron, { opacity: 0.28 + i * 0.14 }]}>˄</Text>
                ))}
              </View>
              <Animated.View style={{ transform: [{ translateY: incomingVideoSwipeY }] }} {...(incomingVideoAcceptPanResponder as any).panHandlers}>
                <TouchableOpacity style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullAcceptBtn]} activeOpacity={1} accessibilityRole="button" accessibilityLabel="Swipe up to accept incoming video call">
                  <CallVideoIncomingIcon size={20} color={colors.white} />
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.incomingVideoFullActionLabel}>Swipe up to accept</Text>
            </View>
            <View style={styles.incomingVideoFullActionGroupSmall}>
              <TouchableOpacity style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullMessageBtn]} activeOpacity={0.8} onPress={dismissIncomingVideoCallModal} accessibilityRole="button" accessibilityLabel="Message caller">
                <VoiceControlMessageIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVideoFullActionLabel}>Message</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Active call modal (voice + video) ─────────────────────────── */}
      <Modal visible={callStateVisible} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined} onRequestClose={minimizeCallState}>
        {activeCallMode === 'video' ? (
          <SafeAreaView style={styles.videoCallBackdrop} edges={['bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={Platform.OS === 'android'} />
            <View style={styles.videoCallContentRoot}>
              <View style={styles.videoCallMediaLayer} collapsable={false}>
                {!isPartnerFullyOff && !showRemoteRtcVideo ? (
                  <Image source={partnerDisplaySource} style={styles.videoCallBgImage} resizeMode="cover" />
                ) : <View style={styles.videoCallBgFallback} />}
                {!videoCallUiHidden ? (
                  isPartnerFullyOff ? (
                    <View style={styles.videoCallForeground}>
                      <View style={styles.videoCallPartnerFullyOffStateCompact}>
                        <Image source={partnerDisplaySource} style={styles.videoCallPartnerFullyOffAvatarCompact} resizeMode="cover" />
                      </View>
                    </View>
                  ) : showRemoteRtcVideo ? (
                    AgoraRtcSurfaceView ? (
                      <AgoraRtcSurfaceView style={styles.videoCallRemoteSurface} canvas={{ uid: remoteRtcUid, renderMode: 1 }} />
                    ) : null
                  ) : (
                    <View style={styles.videoCallForeground}>
                      <View style={styles.videoCallVideoOffState}>
                        <View style={styles.videoCallVideoOffAvatarWrap}>
                          <Image source={partnerDisplaySource} style={styles.videoCallVideoOffAvatar} resizeMode="cover" />
                        </View>
                        <Text style={styles.videoCallVideoOffName} numberOfLines={1}>{name}</Text>
                        <Text style={styles.videoCallVideoOffTitle}>Video is off</Text>
                        <Text style={styles.videoCallVideoOffSubtitle} numberOfLines={2}>Turn on your camera to continue video call.</Text>
                      </View>
                    </View>
                  )
                ) : null}
              </View>

              {!videoCallUiHidden ? (
                <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.videoCallTopGradientLinear} />
              ) : null}

              {!videoCallUiHidden ? (
                <View style={[styles.videoCallTopBar, { paddingTop: Math.max(8, insets.top + 4) }]}>
                  <TouchableOpacity style={styles.videoCallTopBackButton} onPress={minimizeCallState} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Go back to chat">
                    <BackArrowIcon size={48} circular backgroundColor="transparent" strokeColor={colors.white} />
                  </TouchableOpacity>
                  <View style={styles.videoCallTopNameRow}>
                    <View style={styles.videoCallTopNameWrap}>
                      <Text style={styles.videoCallTopName} numberOfLines={1}>{name}</Text>
                    </View>
                    {showPartnerMicOffState ? (
                      <View style={styles.videoCallTopMicOffPill}><VoiceControlMicOffIcon size={12} color={colors.white} /></View>
                    ) : null}
                  </View>
                  <View style={styles.videoCallTopHeaderSpacer}>
                    {callConnectedAtMs != null ? (
                      <View style={styles.videoCallTopTimerPill}>
                        <View style={styles.videoCallTopTimerDot} />
                        <Text style={styles.videoCallTopTimerText}>{callDurationLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* Local PIP */}
              <View style={[styles.videoCallLocalPreview, { bottom: videoCallUiHidden ? videoPipBottomWhenUiHidden : videoPipBottom, right: videoPipRight, width: videoPipWidth, height: videoPipHeight }]}>
                {!showVideoPreviewOffSurface ? (
                  AgoraRtcSurfaceView ? (
                    <AgoraRtcSurfaceView style={styles.videoCallLocalPreviewAvatar} canvas={{ uid: localRtcUid, sourceType: 0, renderMode: 1, mirrorMode: 1 }} zOrderMediaOverlay />
                  ) : (
                    <Image source={localVideoPreviewFallback} style={styles.videoCallLocalPreviewAvatar} resizeMode="cover" />
                  )
                ) : (
                  <View style={styles.videoCallLocalPreviewOffSurface}>
                    <Image source={localVideoPreviewFallback} style={styles.videoCallLocalPreviewOffAvatar} resizeMode="cover" />
                  </View>
                )}
                {!videoCallUiHidden && !callAudioEnabled ? (
                  <View style={styles.videoCallLocalPreviewMicOffIcon}><VoiceControlMicOffIcon size={14} color={colors.white} /></View>
                ) : null}
                {!videoCallUiHidden ? (
                  <TouchableOpacity style={[styles.videoCallLocalPreviewSwitchIcon, { right: videoPipFlipInsetX, bottom: videoPipFlipInsetY }]} activeOpacity={0.75} onPress={flipVideoCallCamera} accessibilityRole="button" accessibilityLabel="Switch camera" hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CameraFlipIcon size={20} color={colors.white} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Video call bottom controls */}
              {!videoCallUiHidden ? (
                <View style={[styles.videoCallBottomControlsWrap, { bottom: videoBottomChromeOffset }]}>
                  <View style={styles.videoCallBottomControlsCapsule}>
                    <TouchableOpacity style={[styles.videoCallBottomAction, styles.videoCallBottomActionEnd]} onPress={closeCallState} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="End video call">
                      <VoiceControlEndIcon size={24} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.videoCallBottomAction, audioRouteFabHighlighted && styles.videoCallBottomActionSelected]} onPress={openAudioDeviceSheet} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Choose audio device">
                      {selectedAudioDevice === 'bluetooth' ? (
                        <AudioBluetoothIcon size={24} color={audioRouteFabHighlighted ? colors.black : colors.white} />
                      ) : (
                        <VoiceControlSpeakerIcon size={24} color={audioRouteFabHighlighted ? colors.black : colors.white} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.videoCallBottomAction, !callVideoEnabled && styles.videoCallBottomActionSelected]} onPress={toggleCallVideo} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={callVideoEnabled ? 'Turn camera off' : 'Turn camera on'}>
                      {callVideoEnabled ? <CallVideoOutgoingIcon size={24} color={colors.white} /> : <CallVideoMissedIcon size={24} color={colors.semantic.error} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.videoCallBottomAction, !callAudioEnabled && styles.videoCallBottomActionSelected]} onPress={toggleCallAudio} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={callAudioEnabled ? 'Mute microphone' : 'Unmute microphone'} accessibilityState={{ selected: !callAudioEnabled }}>
                      {callAudioEnabled ? <VoiceControlMicIcon size={24} color={colors.white} /> : <VoiceControlMicOffIcon size={24} color={colors.semantic.error} />}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {!videoCallUiHidden && audioDeviceSheetVisible ? (
                <View style={[styles.videoCallAudioDevicePopoverWrap, { left: videoAudioPopoverLeft, bottom: videoAudioPopoverBottom }]}>
                  {renderAudioDevicePopoverOptions()}
                </View>
              ) : null}

              {videoCallUiHidden ? (
                <TouchableWithoutFeedback onPress={toggleVideoCallUiHidden}>
                  <View style={styles.videoCallHiddenUiTapArea} />
                </TouchableWithoutFeedback>
              ) : null}
            </View>
          </SafeAreaView>
        ) : (
          /* Voice call screen */
          <SafeAreaView style={styles.callStateBackdrop} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            <View style={[styles.callStateContent, styles.callStateContentRinging]}>
              <View style={[styles.callStateRingingHeader, { paddingTop: Math.max(8, insets.top + 4) }]}>
                <TouchableOpacity style={styles.callStateRingingBackButton} onPress={minimizeCallState} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Go back to chat">
                  <BackArrowIcon size={48} backgroundColor="rgba(0,0,0,0.3)" strokeColor={colors.white} />
                </TouchableOpacity>
                <Text style={styles.callStateRingingHeaderName} numberOfLines={1}>{name}</Text>
                <View style={styles.callStateRingingHeaderSpacer} />
              </View>

              <View style={[styles.callStatePickedCenterWrap, isOutgoingVoiceRinging && styles.callStatePickedCenterWrapRinging]}>
                <View style={styles.callStatePickedAvatarWrap}>
                  {!isOutgoingVoiceRinging ? (
                    <>
                      <View style={styles.callStatePickedOuterRing} />
                      <View style={styles.callStatePickedInnerRing} />
                    </>
                  ) : null}
                  <Image source={partnerDisplaySource} style={[styles.callStateAvatar, isOutgoingVoiceRinging ? styles.callStateAvatarRinging : styles.callStateAvatarPicked]} resizeMode="cover" />
                </View>
                <View style={styles.callStateRingingWrap}>
                  <Text style={styles.callStateRingingTitle}>
                    {isOutgoingVoiceRinging ? 'Ringing...' : pickedVoiceDurationLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.callStateRingingActionsRow}>
                <View style={styles.callStateRingingActionsCapsule}>
                  <TouchableOpacity style={[styles.callStateRingingActionButton, styles.callStateRingingCancelButton]} onPress={closeCallState} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Cancel outgoing call">
                    <View style={[styles.callStateRingingIconWrap, styles.callStateRingingIconWrapEnd]}>
                      <VoiceControlEndIcon size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.callStateRingingActionButton, audioRouteFabHighlighted && styles.callStateRingingActionButtonSelected]} onPress={openAudioDeviceSheet} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Choose audio device">
                    <View style={[styles.callStateRingingIconWrap, styles.callStateRingingIconWrapSpeaker]}>
                      {selectedAudioDevice === 'bluetooth' ? (
                        <AudioBluetoothIcon size={24} color={audioRouteFabHighlighted ? colors.black : colors.white} />
                      ) : (
                        <VoiceControlSpeakerIcon size={24} color={audioRouteFabHighlighted ? colors.black : colors.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callStateRingingActionButton, (isOutgoingVoiceRinging || isSwitchingVoiceToVideo) && styles.callStateRingingActionButtonDisabled]}
                    onPress={!isOutgoingVoiceRinging && !isSwitchingVoiceToVideo ? props.openSwitchToVideoPopup : undefined}
                    disabled={isOutgoingVoiceRinging || isSwitchingVoiceToVideo}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Switch to video call"
                    accessibilityState={{ disabled: isOutgoingVoiceRinging || isSwitchingVoiceToVideo }}
                  >
                    <View style={[styles.callStateRingingIconWrap, styles.callStateRingingIconWrapVideo]}>
                      <CallVideoOutgoingIcon size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.callStateRingingActionButton, !callAudioEnabled && styles.callStateRingingActionButtonMicMuted]} onPress={toggleCallAudio} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={callAudioEnabled ? 'Mute microphone' : 'Unmute microphone'} accessibilityState={{ selected: !callAudioEnabled }}>
                    {callAudioEnabled ? (
                      <View style={[styles.callStateRingingIconWrap, styles.callStateRingingIconWrapMic]}>
                        <VoiceControlMicIcon size={24} color={colors.white} />
                      </View>
                    ) : (
                      <View style={[styles.callStateRingingIconWrap, styles.callStateRingingIconWrapMic]}>
                        <VoiceControlMicOffIcon size={24} color={colors.semantic.error} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {audioDeviceSheetVisible ? (
                <View style={styles.callStateAudioDevicePopover}>{renderAudioDevicePopoverOptions()}</View>
              ) : null}

              {switchToVideoPopupVisible ? (
                <View style={styles.callStateSwitchPopupBackdrop}>
                  <View style={styles.callStateSwitchPopupSheet}>
                    <View style={styles.callStateSwitchPopupHandle} />
                    <View style={styles.callStateSwitchPopupIconWrap}><CallVideoIncomingIcon size={40} color={colors.primary.purple} /></View>
                    <Text style={styles.callStateSwitchPopupTitle}>Switch To Video Call?</Text>
                    <View style={styles.callStateSwitchPopupActions}>
                      <TouchableOpacity style={styles.callStateSwitchPopupCancelButton} activeOpacity={0.8} onPress={cancelSwitchToVideoRequest}>
                        <Text style={styles.callStateSwitchPopupCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.callStateSwitchPopupSwitchButton} activeOpacity={0.85} onPress={requestSwitchVoiceToVideo}>
                        <LinearGradient colors={['#CB7BF5', '#7742F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.callStateSwitchPopupSwitchGradient}>
                          <Text style={styles.callStateSwitchPopupSwitchText}>Switch</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}

              {incomingCallSwitchRequestVisible ? (
                <View style={styles.callStateSwitchPopupBackdrop}>
                  <View style={styles.callStateSwitchPopupSheet}>
                    <View style={styles.callStateSwitchPopupHandle} />
                    <View style={styles.callStateSwitchPopupIconWrap}><CallVideoIncomingIcon size={40} color={colors.primary.purple} /></View>
                    <Text style={styles.callStateSwitchPopupTitle}>Video call request</Text>
                    <Text style={styles.callStateSwitchPopupSubtitle}>The other person wants to switch this call to video.</Text>
                    <View style={styles.callStateSwitchPopupActions}>
                      <TouchableOpacity style={styles.callStateSwitchPopupCancelButton} activeOpacity={0.8} onPress={() => respondToIncomingCallSwitchRequest(false)}>
                        <Text style={styles.callStateSwitchPopupCancelText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.callStateSwitchPopupSwitchButton} activeOpacity={0.85} onPress={() => respondToIncomingCallSwitchRequest(true)}>
                        <LinearGradient colors={['#CB7BF5', '#7742F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.callStateSwitchPopupSwitchGradient}>
                          <Text style={styles.callStateSwitchPopupSwitchText}>Accept</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </>
  );
});
