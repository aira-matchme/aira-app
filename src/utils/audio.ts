import AudioRecorderPlayer from 'react-native-audio-recorder-player';

/**
 * v3.x exports a class — you must instantiate it. Calling methods on the
 * constructor itself makes `startRecorder` undefined and recording fails silently.
 */
const audioRecorderPlayer = new AudioRecorderPlayer();

export const startRecording = async () => {
  console.log('startRecording');
  const uri = `voice_${Date.now()}.m4a`;
  const result = await audioRecorderPlayer.startRecorder(uri);
  console.log('result', result);
  return result;
};

export const stopRecording = async () => {
  const result = await audioRecorderPlayer.stopRecorder();
  audioRecorderPlayer.removeRecordBackListener();
  return result;
};

export const pauseRecording = () => audioRecorderPlayer.pauseRecorder();

export const resumeRecording = () => audioRecorderPlayer.resumeRecorder();

export const playAudio = async (path: string) => {
  await audioRecorderPlayer.startPlayer(path);
};

export const stopAudio = async () => {
  await audioRecorderPlayer.stopPlayer();
};

export const pauseAudio = async () => {
  await audioRecorderPlayer.pausePlayer();
};

export const resumeAudio = async () => {
  await audioRecorderPlayer.resumePlayer();
};
