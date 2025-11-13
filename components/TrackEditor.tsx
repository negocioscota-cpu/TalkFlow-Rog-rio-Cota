import React, { useState, useEffect, useCallback } from 'react';
import type { Track, Voice } from '../types';
import { PlayIcon, PauseIcon, CheckCircleIcon, XCircleIcon, LoadingSpinner } from './Icons';
import { decodeAudioData, decodeBase64 } from '../utils/audioUtils';
import { MAX_TEXT_LENGTH } from '../constants';

interface TrackEditorProps {
  track: Track;
  trackNumber: number;
  availableVoices: Voice[];
  onTextChange: (text: string) => void;
  onVoiceChange: (voice: string) => void;
  onInclusionChange: (shouldInclude: boolean) => void;
}

export const TrackEditor: React.FC<TrackEditorProps> = ({
  track,
  trackNumber,
  availableVoices,
  onTextChange,
  onVoiceChange,
  onInclusionChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      audioSource?.stop();
    };
  }, [audioSource]);

  const handlePlayPreview = useCallback(async () => {
    if (!track.audioData) return;

    if (isPlaying && audioSource) {
      audioSource.stop();
      setIsPlaying(false);
      setAudioSource(null);
      return;
    }
    
    try {
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const rawData = decodeBase64(track.audioData);
      const audioBuffer = await decodeAudioData(rawData, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsPlaying(false);
        setAudioSource(null);
      };
      source.start();
      setAudioSource(source);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio preview:", error);
      alert("Não foi possível reproduzir o áudio.");
    }
  }, [track.audioData, isPlaying, audioSource, audioContext]);

  const StatusIndicator: React.FC = () => {
    switch (track.status) {
      case 'processing':
        return <LoadingSpinner />;
      case 'completed':
        return <CheckCircleIcon className="text-green-400" />;
      case 'error':
        return <XCircleIcon className="text-red-500" title={track.error ?? "Erro"} />;
      default:
        return null;
    }
  };
  
  const textLength = track.text.length;
  const isOverLimit = textLength > MAX_TEXT_LENGTH;

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-4 shadow-lg border border-gray-700 h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-brand-secondary">
          Faixa de Voz <span className="text-white">{trackNumber}</span>
        </h3>
        <div className="w-6 h-6 flex items-center justify-center">
            <StatusIndicator />
        </div>
      </div>
      <div className="flex-grow flex flex-col gap-2">
        <div className="relative flex-grow">
            <textarea
            value={track.text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={`Digite o texto para a faixa ${trackNumber}...`}
            className={`w-full h-full p-2 pb-6 bg-gray-900 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 transition-colors ${isOverLimit ? 'border-red-600 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
            />
            <div className={`absolute bottom-2 right-2 text-xs select-none ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {textLength}/{MAX_TEXT_LENGTH}
            </div>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <select
                value={track.voice}
                onChange={(e) => onVoiceChange(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
            >
            {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                {voice.name}
                </option>
            ))}
            </select>
            <button
                onClick={handlePlayPreview}
                disabled={!track.audioData}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500"
            >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="flex items-center justify-center" title="Incluir no áudio final">
                 <input
                    type="checkbox"
                    checked={track.includeInMaster}
                    onChange={(e) => onInclusionChange(e.target.checked)}
                    disabled={track.status !== 'completed'}
                    className="w-5 h-5 accent-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-dark disabled:cursor-not-allowed"
                />
            </div>
        </div>
      </div>
    </div>
  );
};