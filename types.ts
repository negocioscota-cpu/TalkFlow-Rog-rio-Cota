
export type TrackStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface Track {
  id: number;
  text: string;
  voice: string;
  status: TrackStatus;
  audioData: string | null;
  error: string | null;
  includeInMaster: boolean;
}

export interface Voice {
  id: string;
  name: string;
}

export interface ScriptLine {
  character: number;
  line: string;
}

export type SequenceItem = 
  | { type: 'track'; id: string; trackId: number }
  | { type: 'silence'; id: string; duration: number };
