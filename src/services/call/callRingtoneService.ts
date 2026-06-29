import { Image, Platform, Vibration } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import NitroSound from 'react-native-nitro-sound';

type RingMode = 'incoming' | 'outgoing' | null;

/** Android vibration pattern while incoming ring plays (ms). */
const INCOMING_VIBRATE_PATTERN = [0, 800, 800, 800];

const ANDROID_INCOMING_RING_URI = Image.resolveAssetSource(
  require('../../assets/sounds/incoming_call_ring.wav'),
).uri;

let activeMode: RingMode = null;
let outgoingSessionStarted = false;
let androidIncomingLoopActive = false;
let androidPlaybackEndListenerAttached = false;

async function releaseVoiceMessageAudio(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const audio = require('../../utils/audio');
    await audio.stopAudio?.().catch?.(() => {});
    await audio.stopRecording?.().catch?.(() => {});
  } catch {
    /* ignore */
  }
}

function safeStopRingtone(): void {
  try {
    InCallManager.stopRingtone();
  } catch {
    /* ignore */
  }
}

function safeStopRingback(): void {
  try {
    InCallManager.stopRingback();
  } catch {
    /* ignore */
  }
}

function safeStopOutgoingSession(): void {
  if (!outgoingSessionStarted) return;
  outgoingSessionStarted = false;
  try {
    InCallManager.stop();
  } catch {
    /* ignore */
  }
}

function ensureAndroidIncomingPlaybackEndListener(): void {
  if (androidPlaybackEndListenerAttached) return;
  androidPlaybackEndListenerAttached = true;
  NitroSound.addPlaybackEndListener(() => {
    if (!androidIncomingLoopActive || activeMode !== 'incoming' || Platform.OS !== 'android') return;
    Vibration.vibrate(INCOMING_VIBRATE_PATTERN);
    void NitroSound.startPlayer(ANDROID_INCOMING_RING_URI).catch(() => {});
  });
}

async function stopAndroidIncomingRing(): Promise<void> {
  androidIncomingLoopActive = false;
  Vibration.cancel();
  try {
    await NitroSound.stopPlayer();
  } catch {
    /* ignore */
  }
}

async function startAndroidIncomingRing(): Promise<void> {
  ensureAndroidIncomingPlaybackEndListener();
  androidIncomingLoopActive = true;
  Vibration.vibrate(INCOMING_VIBRATE_PATTERN);
  try {
    await NitroSound.startPlayer(ANDROID_INCOMING_RING_URI);
  } catch (error) {
    androidIncomingLoopActive = false;
    Vibration.cancel();
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[callRingtone] Android incoming ring failed', error);
    }
    throw error;
  }
}

function resolveOutgoingRingbackToken(): string {
  // Android bundled tones avoid STREAM_RING volume / vibrate-only ringer edge cases.
  return Platform.OS === 'android' ? '_BUNDLE_' : '_DEFAULT_';
}

/** Play incoming-call ring (system default when available). */
export async function startIncomingCallRing(): Promise<void> {
  if (activeMode === 'incoming') return;
  await stopCallRing();
  await releaseVoiceMessageAudio();
  activeMode = 'incoming';
  try {
    if (Platform.OS === 'android') {
      await startAndroidIncomingRing();
      return;
    }
    (InCallManager.startRingtone as (ringtone: string, vibratePattern?: number | number[]) => void)(
      '_DEFAULT_',
    );
  } catch (error) {
    activeMode = null;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[callRingtone] startIncomingCallRing failed', error);
    }
  }
}

/** Play outgoing ringback while waiting for the callee to answer. */
export async function startOutgoingCallRingback(isVideo = false): Promise<void> {
  if (activeMode === 'outgoing') return;
  await stopCallRing();
  await releaseVoiceMessageAudio();
  activeMode = 'outgoing';
  try {
    InCallManager.start({
      media: isVideo ? 'video' : 'audio',
      auto: false,
      ringback: resolveOutgoingRingbackToken(),
    });
    outgoingSessionStarted = true;
  } catch (error) {
    activeMode = null;
    outgoingSessionStarted = false;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[callRingtone] startOutgoingCallRingback failed', error);
    }
  }
}

/** Stop any active incoming ring or outgoing ringback. Safe to call repeatedly. */
export async function stopCallRing(): Promise<void> {
  activeMode = null;
  if (Platform.OS === 'android') {
    await stopAndroidIncomingRing();
  }
  safeStopRingtone();
  safeStopRingback();
  safeStopOutgoingSession();
}

export function isCallRingActive(): boolean {
  return activeMode !== null;
}
