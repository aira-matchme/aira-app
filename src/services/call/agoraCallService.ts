import { Platform } from 'react-native';
import { env } from '../../config/env';

type AgoraEngineLike = {
  initialize?: (config: Record<string, unknown>) => Promise<void> | void;
  setChannelProfile?: (profile: number) => Promise<void> | void;
  setClientRole?: (role: number) => Promise<void> | void;
  enableAudio?: () => Promise<void> | void;
  enableVideo?: () => Promise<void> | void;
  enableLocalAudio?: (enabled: boolean) => Promise<void> | void;
  enableLocalVideo?: (enabled: boolean) => Promise<void> | void;
  muteLocalAudioStream?: (muted: boolean) => Promise<void> | void;
  muteLocalVideoStream?: (muted: boolean) => Promise<void> | void;
  startPreview?: () => Promise<void> | void;
  stopPreview?: () => Promise<void> | void;
  switchCamera?: () => Promise<void> | void;
  setDefaultAudioRouteToSpeakerphone?: (speaker: boolean) => Promise<void> | void;
  setEnableSpeakerphone?: (speaker: boolean) => Promise<void> | void;
  joinChannel?: (
    token: string,
    channelName: string,
    uid: number,
    options?: Record<string, unknown>
  ) => Promise<void> | void;
  leaveChannel?: () => Promise<void> | void;
  release?: () => Promise<void> | void;
  removeAllListeners?: () => Promise<void> | void;
  registerEventHandler?: (handler: Record<string, unknown>) => Promise<void> | void;
};

const AGORA_CHANNEL_PROFILE_COMMUNICATION = 0;
const AGORA_CLIENT_ROLE_BROADCASTER = 1;

class AgoraCallService {
  private engine: AgoraEngineLike | null = null;
  private initialized = false;
  private joinedChannelName: string | null = null;
  private remoteUid: number | null = null;
  private remoteUidListeners = new Set<(uid: number | null) => void>();

  private setRemoteUid(uid: number | null) {
    this.remoteUid = uid;
    this.remoteUidListeners.forEach((listener) => listener(uid));
  }

  private pickUid(...values: unknown[]): number | null {
    for (const value of values) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
      if (typeof value === 'string' && /^\d+$/.test(value)) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
      if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const nested = this.pickUid(
          obj.uid,
          obj.remoteUid,
          obj.userId,
          obj.user_id,
          obj.participantId,
          obj.participant_id
        );
        if (nested != null) return nested;
      }
    }
    return null;
  }

  private async getEngine(): Promise<AgoraEngineLike | null> {
    if (this.engine) return this.engine;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
      const agoraModule = require('react-native-agora');
      const createEngineFn =
        agoraModule?.createAgoraRtcEngine ??
        agoraModule?.createAgoraRtcEngineEx ??
        agoraModule?.default?.createAgoraRtcEngine;
      if (typeof createEngineFn === 'function') {
        this.engine = createEngineFn() as AgoraEngineLike;
      } else if (agoraModule?.RtcEngine?.create) {
        this.engine = (await agoraModule.RtcEngine.create(env.AGORA_APP_ID)) as AgoraEngineLike;
      }
      return this.engine;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] failed to load module', error);
      return null;
    }
  }

  async ensureInitialized() {
    if (this.initialized) return;
    const appId = String(env.AGORA_APP_ID ?? '').trim();
    if (!appId) {
      // eslint-disable-next-line no-console
      console.log('[agora] missing AGORA_APP_ID in env');
      return;
    }
    const engine = await this.getEngine();
    if (!engine) return;
    try {
      await engine.initialize?.({ appId });
      await engine.setChannelProfile?.(AGORA_CHANNEL_PROFILE_COMMUNICATION);
      await engine.setClientRole?.(AGORA_CLIENT_ROLE_BROADCASTER);
      await engine.enableAudio?.();
      await engine.registerEventHandler?.({
        onUserJoined: (...args: unknown[]) => {
          const uid = this.pickUid(...args);
          if (uid != null) {
            // eslint-disable-next-line no-console
            console.log('[agora] remote user joined', { uid });
            this.setRemoteUid(uid);
          }
        },
        onUserOffline: (...args: unknown[]) => {
          const uid = this.pickUid(...args);
          if (uid != null && this.remoteUid === uid) {
            // eslint-disable-next-line no-console
            console.log('[agora] remote user offline', { uid });
            this.setRemoteUid(null);
          }
        },
        onRemoteVideoStateChanged: (...args: unknown[]) => {
          const uid = this.pickUid(...args);
          if (uid != null && this.remoteUid == null) {
            // eslint-disable-next-line no-console
            console.log('[agora] remote video state changed', { uid });
            this.setRemoteUid(uid);
          }
        },
        onFirstRemoteVideoDecoded: (...args: unknown[]) => {
          const uid = this.pickUid(...args);
          if (uid != null) {
            // eslint-disable-next-line no-console
            console.log('[agora] first remote video decoded', { uid });
            this.setRemoteUid(uid);
          }
        },
        onLeaveChannel: () => {
          this.setRemoteUid(null);
        },
      });
      this.initialized = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] initialize failed', error);
    }
  }

  async joinVoiceChannel(params: {
    channelName?: string;
    token?: string | null;
    uid?: number;
    isVideoCall?: boolean;
    localVideoEnabled?: boolean;
  }) {
    const channelName = String(params.channelName ?? '').trim();
    if (!channelName) {
      // eslint-disable-next-line no-console
      console.log('[agora] join skipped: missing channel name');
      return;
    }
    await this.ensureInitialized();
    if (!this.engine || !this.initialized) return;
    try {
      const token = String(params.token ?? '').trim();
      const uid = typeof params.uid === 'number' ? params.uid : 0;
      const isVideoCall = params.isVideoCall === true;
      const localVideoEnabled = params.localVideoEnabled !== false;
      if (isVideoCall) {
        if (localVideoEnabled) {
          await this.engine.startPreview?.();
        }
        await this.engine.enableVideo?.();
        await this.engine.enableLocalVideo?.(localVideoEnabled);
        await this.engine.muteLocalVideoStream?.(!localVideoEnabled);
      }
      await this.engine.joinChannel?.(token, channelName, uid, {
        clientRoleType: AGORA_CLIENT_ROLE_BROADCASTER,
        channelProfile: AGORA_CHANNEL_PROFILE_COMMUNICATION,
        publishMicrophoneTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: isVideoCall,
        publishCameraTrack: isVideoCall && localVideoEnabled,
      });
      this.joinedChannelName = channelName;
      // eslint-disable-next-line no-console
      console.log('[agora] joined rtc channel', { channelName, uid, isVideoCall, localVideoEnabled, platform: Platform.OS });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] join failed', error);
    }
  }

  async setMuted(muted: boolean) {
    if (!this.engine) return;
    try {
      await this.engine.muteLocalAudioStream?.(muted);
      await this.engine.enableLocalAudio?.(!muted);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] mute toggle failed', error);
    }
  }

  async setSpeakerEnabled(enabled: boolean) {
    if (!this.engine) return;
    try {
      await this.engine.setDefaultAudioRouteToSpeakerphone?.(enabled);
      await this.engine.setEnableSpeakerphone?.(enabled);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] speaker route failed', error);
    }
  }

  async setLocalVideoEnabled(enabled: boolean) {
    if (!this.engine) return;
    try {
      await this.engine.enableVideo?.();
      await this.engine.enableLocalVideo?.(enabled);
      await this.engine.muteLocalVideoStream?.(!enabled);
      if (enabled) {
        await this.engine.startPreview?.();
      } else {
        await this.engine.stopPreview?.();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] local video toggle failed', error);
    }
  }

  async flipCamera() {
    if (!this.engine) return;
    try {
      await this.engine.switchCamera?.();
      // eslint-disable-next-line no-console
      console.log('[agora] switch camera');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] switch camera failed', error);
    }
  }

  async leaveChannel() {
    if (!this.engine) return;
    try {
      await this.engine.leaveChannel?.();
      this.joinedChannelName = null;
      this.setRemoteUid(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[agora] leave failed', error);
    }
  }

  onRemoteUidChange(listener: (uid: number | null) => void): () => void {
    this.remoteUidListeners.add(listener);
    listener(this.remoteUid);
    return () => {
      this.remoteUidListeners.delete(listener);
    };
  }
}

export const agoraCallService = new AgoraCallService();
