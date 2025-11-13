
import React, { useState, useEffect } from 'react';
import type { Track, SequenceItem } from '../types';
import { CombineIcon, LoadingSpinner } from './Icons';

interface SequencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onFinalize: (sequence: SequenceItem[]) => Promise<void>;
  isProcessing: boolean;
}

export const SequencerModal: React.FC<SequencerModalProps> = ({ isOpen, onClose, tracks, onFinalize, isProcessing }) => {
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<SequenceItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialSequence: SequenceItem[] = tracks.map(track => ({
        type: 'track',
        id: `track-${track.id}`,
        trackId: track.id,
      }));
      setSequence(initialSequence);
    }
  }, [isOpen, tracks]);

  if (!isOpen) {
    return null;
  }

  const addSilence = (duration: number) => {
    const newSilence: SequenceItem = {
      type: 'silence',
      id: `silence-${Date.now()}`,
      duration: duration,
    };
    setSequence(prev => [...prev, newSilence]);
  };

  const removeSequenceItem = (id: string) => {
    setSequence(prev => prev.filter(item => item.id !== id));
  };

  const handleDragStart = (item: SequenceItem) => {
    setDraggedItem(item);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const newSequence = sequence.filter(item => item.id !== draggedItem.id);
    newSequence.splice(targetIndex, 0, draggedItem);
    
    setSequence(newSequence);
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    if (isProcessing) return;
    onFinalize(sequence);
  };
  
  const getTrackById = (trackId: number) => tracks.find(t => t.id === trackId);

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-2xl border border-gray-700 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-primary">Modo Sequenciador</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none">&times;</button>
        </div>
        <p className="text-gray-400">
          Arraste e solte as faixas para reordenar. Adicione pausas para controlar o ritmo da sua criação de áudio.
        </p>

        <div className="bg-gray-900 p-4 rounded-md border border-gray-700 h-64 overflow-y-auto flex flex-col gap-2">
            {sequence.map((item, index) => (
                <div 
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`p-3 rounded-md flex justify-between items-center cursor-grab active:cursor-grabbing transition-shadow shadow-md ${item.type === 'track' ? 'bg-brand-primary/20 border border-brand-primary' : 'bg-gray-700 border border-gray-600'}`}
                >
                    {item.type === 'track' ? (
                        <div>
                            <p className="font-bold text-brand-secondary">Faixa {getTrackById(item.trackId)?.id + 1}</p>
                            <p className="text-sm text-gray-300 truncate max-w-xs">{getTrackById(item.trackId)?.text}</p>
                        </div>
                    ) : (
                        <p className="font-semibold text-gray-300">Pausa de {item.duration}s</p>
                    )}
                    <button onClick={() => removeSequenceItem(item.id)} className="text-red-400 hover:text-red-300 text-xl font-bold">&times;</button>
                </div>
            ))}
             <div onDragOver={handleDragOver} onDrop={() => handleDrop(sequence.length)} className="flex-grow"></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-gray-300">Adicionar Pausa:</span>
                <button onClick={() => addSilence(0.5)} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">0.5s</button>
                <button onClick={() => addSilence(1.0)} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">1.0s</button>
                <button onClick={() => addSilence(2.0)} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">2.0s</button>
            </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || sequence.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-900 bg-brand-secondary rounded-lg shadow-md hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? <LoadingSpinner /> : <CombineIcon />}
            {isProcessing ? 'Processando...' : 'Finalizar e Baixar'}
          </button>
        </div>
      </div>
    </div>
  );
};
