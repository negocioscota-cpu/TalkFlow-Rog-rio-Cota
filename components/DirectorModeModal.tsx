import React, { useState } from 'react';
import { NUM_TRACKS } from '../constants';
import { DirectorIcon, LoadingSpinner } from './Icons';

interface DirectorModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, numVoices: number) => Promise<void>;
}

export const DirectorModeModal: React.FC<DirectorModeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [numVoices, setNumVoices] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onSubmit(prompt, numVoices);
      setPrompt(''); // Limpa o prompt em caso de sucesso
    } catch (error) {
      // O erro é tratado em App.tsx, mas ainda precisamos parar o carregamento
      console.error("Submission failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-lg p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-gray-700 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-3">
            <DirectorIcon />
            Modo Diretor
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none">&times;</button>
        </div>
        <p className="text-gray-400">
            Descreva uma cena ou ideia, e a IA irá gerar o diálogo e preencher as faixas de voz para você.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Um diálogo curto entre um pirata e um robô discutindo sobre um mapa do tesouro."
            className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
            required
            disabled={isGenerating}
          />
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label htmlFor="num-voices" className="text-gray-300 whitespace-nowrap">
              Número de Vozes:
            </label>
            <input
              type="number"
              id="num-voices"
              min="2"
              max={NUM_TRACKS}
              value={numVoices}
              onChange={(e) => setNumVoices(parseInt(e.target.value, 10))}
              className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
              disabled={isGenerating}
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full sm:w-auto flex items-center self-end justify-center gap-2 px-6 py-3 font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isGenerating ? <LoadingSpinner /> : <DirectorIcon />}
            {isGenerating ? 'Gerando Roteiro...' : 'Gerar Roteiro'}
          </button>
        </form>
      </div>
    </div>
  );
};
