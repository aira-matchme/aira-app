import NitroSound from 'react-native-nitro-sound';

const sound = NitroSound;

/** When true, ignore rn-playback end detection (manual stop / session ended). */
let playbackEndLatch = false;

let playbackEndedCallback: (() => void) | null = null;

/**
 * Called when playback reaches the end (native player stops shortly after).
 * Chat UI uses this to reset play/pause icons — without it, the UI stays on "pause"
 * after the track finishes because React state never clears.
 */
export const setPlaybackEndedCallback = (cb: (() => void) | null) => {
  playbackEndedCallback = cb;
};

sound.addPlayBackListener((e: any) => {
  if (playbackEndLatch) return;
  const duration = typeof e.duration === 'number' ? e.duration : 0;
  const pos = typeof e.currentPosition === 'number' ? e.currentPosition : 0;
  if (duration <= 0) return;
  // Match library tolerance (see index.ts playerCallback); allow small jitter.
  if (pos + 5 < duration) return;
  playbackEndLatch = true;
  playbackEndedCallback?.();
});

export const startRecording = async () => {
  // Let native pick a writable temp path and return absolute URI.
  // Relative filenames can break multipart uploads on some Android devices.
  const result = await sound.startRecorder();
  return result;
};

export const stopRecording = async () => {
  const result = await sound.stopRecorder();
  sound.removeRecordBackListener();
  return result;
};

export const pauseRecording = () => sound.pauseRecorder();

export const resumeRecording = () => sound.resumeRecorder();

export const playAudio = async (path: string) => {
  playbackEndLatch = false;
  await sound.startPlayer(path);
};

export const stopAudio = async () => {
  playbackEndLatch = true;
  await sound.stopPlayer();
};

export const pauseAudio = async () => {
  await sound.pausePlayer();
};

export const resumeAudio = async () => {
  await sound.resumePlayer();
};
