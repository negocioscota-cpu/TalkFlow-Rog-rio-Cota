import type { Track, Voice } from './types';

export const NUM_TRACKS = 6;
export const MAX_TEXT_LENGTH = 5000;

export const AVAILABLE_VOICES: Voice[] = [
  { id: 'Kore', name: 'Kore (Feminino)' },
  { id: 'Puck', name: 'Puck (Masculino)' },
  { id: 'Charon', name: 'Charon (Masculino)' },
  { id: 'Fenrir', name: 'Fenrir (Feminino)' },
  { id: 'Zephyr', name: 'Zephyr (Feminino)' },
  { id: 'Leda', name: 'Leda (Feminino)' },
  { id: 'Iapetus', name: 'Iapetus (Masculino)' },
  { id: 'Umbriel', name: 'Umbriel (Masculino)' },
  { id: 'Autonoe', name: 'Autonoe (Feminino)' },
  { id: 'Erinome', name: 'Erinome (Feminino)' },
];

export const INITIAL_TRACKS: Track[] = Array.from({ length: NUM_TRACKS }, (_, i) => ({
  id: i,
  text: '',
  voice: AVAILABLE_VOICES[i % AVAILABLE_VOICES.length].id, // Cycle through voices
  status: 'idle',
  audioData: null,
  error: null,
  includeInMaster: false,
}));