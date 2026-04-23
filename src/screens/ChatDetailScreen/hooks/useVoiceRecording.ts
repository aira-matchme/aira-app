import { useState, useEffect, useRef, useCallback } from 'react';
import {
  startRecording as startAudioRecording,
  stopRecording as stopAudioRecording,
  pauseRecording as pauseAudioRecording,
  resumeRecording as resumeAudioRecording,
  playAudio,
  stopAudio,
  pauseAudio,
  resumeAudio,
  setPlaybackEndedCallback,
} from '../../../utils/audio';

interface UseVoiceRecordingParams {
  onSendVoice: (filePath: string) => Promise<void>;
}

interface UseVoiceRecordingResult {
  voiceBarVisible: boolean;
  voiceSeconds: number;
  voicePaused: boolean;
  voiceSendLoading: boolean;
  recordFilePath: string | null;
  playingVoiceMessageKey: string | null;
  voiceListenPaused: boolean;
  beginVoiceRecording: () => Promise<void>;
  handleVoiceTrash: () => void;
  handleVoicePlayPause: () => void;
  handleVoiceSend: () => Promise<void>;
  stopVoiceRecordingSafely: () => Promise<string | null>;
  toggleVoiceMessagePlayback: (uri: string, messageKey: string) => Promise<void>;
  formatVoiceTime: (seconds: number) => string;
  resetVoiceState: () => void;
}

export function useVoiceRecording({ onSendVoice }: UseVoiceRecordingParams): UseVoiceRecordingResult {
  const [voiceBarVisible, setVoiceBarVisible] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voicePaused, setVoicePaused] = useState(false);
  const [voiceSendLoading, setVoiceSendLoading] = useState(false);
  const [recordFilePath, setRecordFilePath] = useState<string | null>(null);
  const [playingVoiceMessageKey, setPlayingVoiceMessageKey] = useState<string | null>(null);
  const [voiceListenPaused, setVoiceListenPaused] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);

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

  useEffect(() => {
    setPlaybackEndedCallback(() => {
      setPlayingVoiceMessageKey(null);
      setVoiceListenPaused(false);
    });
    return () => setPlaybackEndedCallback(null);
  }, []);

  const resetVoiceState = useCallback(() => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (isRecordingRef.current) {
      stopAudioRecording().catch(() => {});
      isRecordingRef.current = false;
    }
    stopAudio().catch(() => {});
    setPlayingVoiceMessageKey(null);
    setVoiceListenPaused(false);
    setVoiceBarVisible(false);
    setVoicePaused(false);
    setVoiceSeconds(0);
    setRecordFilePath(null);
  }, []);

  const startVoiceRecording = useCallback(async () => {
    try {
      const path = await startAudioRecording();
      isRecordingRef.current = true;
      setRecordFilePath(path);
    } catch {
      setVoiceBarVisible(false);
    }
  }, []);

  const beginVoiceRecording = useCallback(async () => {
    setVoiceBarVisible(true);
    setVoiceSeconds(0);
    setVoicePaused(false);
    await startVoiceRecording();
  }, [startVoiceRecording]);

  const handleVoiceTrash = useCallback(() => {
    if (isRecordingRef.current) {
      stopAudioRecording().catch(() => {});
      isRecordingRef.current = false;
    }
    setRecordFilePath(null);
    setVoiceBarVisible(false);
    setVoiceSeconds(0);
    setVoicePaused(false);
  }, []);

  const handleVoicePlayPause = useCallback(() => {
    if (!isRecordingRef.current) return;
    if (voicePaused) {
      resumeAudioRecording().catch(() => {});
    } else {
      pauseAudioRecording().catch(() => {});
    }
    setVoicePaused((p) => !p);
  }, [voicePaused]);

  const stopVoiceRecordingSafely = useCallback(async () => {
    try {
      const result = await stopAudioRecording();
      isRecordingRef.current = false;
      return result;
    } catch {
      return null;
    }
  }, []);

  const handleVoiceSend = useCallback(async () => {
    if (voiceSendLoading) return;
    setVoiceSendLoading(true);
    try {
      const path = await stopVoiceRecordingSafely();
      const uploadPath = path ?? recordFilePath;
      if (!uploadPath) {
        setVoiceBarVisible(false);
        return;
      }
      await onSendVoice(uploadPath);
      setVoiceBarVisible(false);
      setVoiceSeconds(0);
      setVoicePaused(false);
      setRecordFilePath(null);
    } finally {
      setVoiceSendLoading(false);
    }
  }, [voiceSendLoading, stopVoiceRecordingSafely, recordFilePath, onSendVoice]);

  const toggleVoiceMessagePlayback = useCallback(async (
    uri: string,
    messageKey: string,
  ) => {
    try {
      if (playingVoiceMessageKey !== messageKey) {
        await stopAudio().catch(() => {});
        setVoiceListenPaused(false);
        await playAudio(uri);
        setPlayingVoiceMessageKey(messageKey);
        return;
      }
      if (voiceListenPaused) {
        await resumeAudio();
        setVoiceListenPaused(false);
      } else {
        await pauseAudio();
        setVoiceListenPaused(true);
      }
    } catch {
      setPlayingVoiceMessageKey(null);
      setVoiceListenPaused(false);
    }
  }, [playingVoiceMessageKey, voiceListenPaused]);

  const formatVoiceTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    voiceBarVisible,
    voiceSeconds,
    voicePaused,
    voiceSendLoading,
    recordFilePath,
    playingVoiceMessageKey,
    voiceListenPaused,
    beginVoiceRecording,
    handleVoiceTrash,
    handleVoicePlayPause,
    handleVoiceSend,
    stopVoiceRecordingSafely,
    toggleVoiceMessagePlayback,
    formatVoiceTime,
    resetVoiceState,
  };
}
