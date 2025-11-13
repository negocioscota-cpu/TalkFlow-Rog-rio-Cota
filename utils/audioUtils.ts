
// Declare the lamejs library loaded from the script tag in index.html
declare const lamejs: any;

// This function decodes a base64 string into a Uint8Array.
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// This function decodes raw PCM audio data into an AudioBuffer.
// It's necessary because the browser's native decodeAudioData expects a file format (like WAV or MP3), not raw samples.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The API returns 16-bit PCM, so we create a Int16Array view on the buffer.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit integer sample to a float between -1.0 and 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Creates an AudioBuffer containing only silence for a specified duration.
export function createSilentBuffer(durationInSeconds: number, context: AudioContext): AudioBuffer {
  const frameCount = context.sampleRate * durationInSeconds;
  // Use a single channel (mono) for silence.
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  return buffer;
}


// Concatenates multiple AudioBuffers into a single AudioBuffer.
export function concatenateAudioBuffers(buffers: AudioBuffer[], context: AudioContext): AudioBuffer {
  if (buffers.length === 0) {
    return context.createBuffer(1, 1, context.sampleRate);
  }

  let totalLength = 0;
  for (const buffer of buffers) {
    totalLength += buffer.length;
  }

  const firstBuffer = buffers[0];
  const outputBuffer = context.createBuffer(
    firstBuffer.numberOfChannels,
    totalLength,
    firstBuffer.sampleRate
  );

  let offset = 0;
  for (const buffer of buffers) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      // Ensure the buffer has data for the channel before trying to set it.
      // This handles concatenating mono (silence) and stereo buffers if needed.
      if (channel < buffer.numberOfChannels) {
         outputBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
      }
    }
    offset += buffer.length;
  }

  return outputBuffer;
}

// Converts an AudioBuffer to an MP3 file Blob using lamejs.
export function bufferToMp3(buffer: AudioBuffer): Blob {
  // LameJS is loaded from a script tag in index.html
  const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, 128); // 128kbps bitrate
  const mp3Data: Int8Array[] = [];

  // LameJS expects Int16 samples, not Float32.
  // We need to convert the Float32Array from getChannelData to Int16.
  // The app only deals with mono audio, so we only process channel 0.
  const pcmFloat = buffer.getChannelData(0);
  const pcmInt16 = new Int16Array(pcmFloat.length);
  
  for (let i = 0; i < pcmFloat.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmFloat[i]));
    // convert to 16-bit signed integer
    pcmInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  const sampleBlockSize = 1152; // Recommended block size for lamejs
  for (let i = 0; i < pcmInt16.length; i += sampleBlockSize) {
    const sampleChunk = pcmInt16.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush(); // Finish encoding
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, { type: 'audio/mpeg' });
}
