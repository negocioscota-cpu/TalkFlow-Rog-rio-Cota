
import React, { useState, useCallback, useMemo } from 'react';
import { TrackEditor } from './components/TrackEditor';
import { GenerateIcon, LoadingSpinner, CombineIcon, DirectorIcon, SequenceIcon } from './components/Icons';
import { DirectorModeModal } from './components/DirectorModeModal';
import { SequencerModal } from './components/SequencerModal';
import type { Track, TrackStatus, ScriptLine, SequenceItem } from './types';
import { generateSpeech, generateScript } from './services/geminiService';
import { concatenateAudioBuffers, bufferToMp3, decodeAudioData, decodeBase64, createSilentBuffer } from './utils/audioUtils';
import { INITIAL_TRACKS, AVAILABLE_VOICES, MAX_TEXT_LENGTH } from './constants';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [isSequencerModalOpen, setIsSequencerModalOpen] = useState(false);
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  const updateTrack = useCallback((index: number, updatedTrack: Partial<Track>) => {
    setTracks(prevTracks => 
      prevTracks.map((track, i) => i === index ? { ...track, ...updatedTrack } : track)
    );
  }, []);

  const handleGenerateScript = async (prompt: string, numVoices: number) => {
    setIsScriptGenerating(true);
    try {
        const script: ScriptLine[] = await generateScript(prompt, numVoices);

        const dialogues: string[] = Array(numVoices).fill('');
        
        script.forEach(line => {
            const characterIndex = line.character - 1;
            if (characterIndex >= 0 && characterIndex < numVoices) {
                dialogues[characterIndex] += line.line + '\n\n';
            }
        });

        setTracks(prevTracks => {
            const newTracks = prevTracks.map(track => ({
                ...track,
                text: '',
                status: 'idle' as TrackStatus,
                audioData: null,
                error: null,
                includeInMaster: false,
            }));

            dialogues.forEach((dialogue, index) => {
                if (index < newTracks.length) {
                    newTracks[index].text = dialogue.trim();
                }
            });

            return newTracks;
        });

        setIsDirectorModalOpen(false);
    } catch (error) {
        console.error("Falha ao gerar o roteiro:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        alert(`Ocorreu um erro ao gerar o roteiro. Por favor, tente novamente.\n\nDetalhes: ${errorMessage}`);
    } finally {
        setIsScriptGenerating(false);
    }
  };


  const handleGenerateAll = useCallback(async () => {
    setIsGenerating(true);
    const generationPromises = tracks.map(async (track, index) => {
      if (!track.text.trim()) {
        updateTrack(index, { status: 'idle', includeInMaster: false });
        return;
      }
      if (track.text.length > MAX_TEXT_LENGTH) {
        console.error(`Text for track ${index + 1} exceeds character limit.`);
        updateTrack(index, { status: 'error', error: `Texto excede o limite de ${MAX_TEXT_LENGTH} caracteres.`, includeInMaster: false });
        return;
      }
      try {
        updateTrack(index, { status: 'processing', audioData: null, error: null, includeInMaster: false });
        const audioBase64 = await generateSpeech(track.text, track.voice);
        updateTrack(index, { status: 'completed', audioData: audioBase64, includeInMaster: true });
      } catch (error) {
        console.error(`Error generating audio for track ${index + 1}:`, error);
        updateTrack(index, { status: 'error', error: 'Falha ao gerar áudio.', includeInMaster: false });
      }
    });

    await Promise.allSettled(generationPromises);
    setIsGenerating(false);
  }, [tracks, updateTrack]);

  const handleOpenSequencer = () => {
    setIsSequencerModalOpen(true);
  };

  const handleFinalizeAndDownload = useCallback(async (sequence: SequenceItem[]) => {
    setIsCombining(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const buffers: AudioBuffer[] = await Promise.all(
        sequence.map(item => {
          if (item.type === 'track') {
            const track = tracks.find(t => t.id === item.trackId);
            if (track && track.audioData) {
              const rawData = decodeBase64(track.audioData);
              return decodeAudioData(rawData, audioContext, 24000, 1);
            }
          } else if (item.type === 'silence') {
            return createSilentBuffer(item.duration, audioContext);
          }
          return null;
        })
      );

      const validBuffers = buffers.filter((b): b is AudioBuffer => b !== null);

      if (validBuffers.length === 0) {
        alert("Nenhuma faixa de áudio válida na sequência para combinar.");
        return;
      }

      const masterBuffer = concatenateAudioBuffers(validBuffers, audioContext);
      const mp3Blob = bufferToMp3(masterBuffer);

      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'TalkFlow_Master_Audio.mp3';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setIsSequencerModalOpen(false);
    } catch (error) {
      console.error("Error combining and encoding to MP3:", error);
      alert("Ocorreu um erro ao combinar e codificar os áudios para MP3.");
    } finally {
      setIsCombining(false);
    }
  }, [tracks]);

  const hasTextOverLimit = useMemo(() => tracks.some(t => t.text.length > MAX_TEXT_LENGTH), [tracks]);
  const canGenerate = useMemo(() => !isGenerating && !hasTextOverLimit && tracks.some(t => t.text.trim().length > 0), [isGenerating, hasTextOverLimit, tracks]);
  const canOpenSequencer = useMemo(() => !isCombining && !isGenerating && tracks.some(t => t.status === 'completed' && t.includeInMaster), [isCombining, isGenerating, tracks]);
  
  const completedTracks = useMemo(() => tracks.filter(t => t.status === 'completed'), [tracks]);
  const allCompletedSelected = useMemo(() => completedTracks.length > 0 && completedTracks.every(t => t.includeInMaster), [completedTracks]);

  const handleSelectAllToggle = useCallback(() => {
    const newValue = !allCompletedSelected;
    setTracks(prev => prev.map(t => 
      t.status === 'completed' ? { ...t, includeInMaster: newValue } : t
    ));
  }, [allCompletedSelected]);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
        <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-brand-primary">TalkFlow</h1>
            <p className="hidden md:block text-gray-400">Estúdio de Síntese de Voz Paralela</p>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, index) => (
              <TrackEditor
                key={track.id}
                track={track}
                trackNumber={index + 1}
                availableVoices={AVAILABLE_VOICES}
                onTextChange={(text) => updateTrack(index, { text })}
                onVoiceChange={(voice) => updateTrack(index, { voice })}
                onInclusionChange={(shouldInclude) => updateTrack(index, { includeInMaster: shouldInclude })}
              />
            ))}
          </div>
        </main>

        <footer className="bg-gray-800/70 backdrop-blur-sm p-4 sticky bottom-0 z-10 border-t border-gray-700">
          <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setIsDirectorModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
            >
              <DirectorIcon />
              Modo Diretor
            </button>
            <button
              onClick={handleGenerateAll}
              disabled={!canGenerate}
              title={hasTextOverLimit ? `Uma ou mais faixas excedem o limite de ${MAX_TEXT_LENGTH} caracteres.` : 'Gerar áudio para todas as faixas preenchidas'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isGenerating ? <LoadingSpinner /> : <GenerateIcon />}
              {isGenerating ? 'Gerando...' : 'Gerar Todos os Áudios'}
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenSequencer}
                disabled={!canOpenSequencer}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-900 bg-brand-secondary rounded-lg shadow-md hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <SequenceIcon />
                Sequenciar e Baixar
              </button>
              <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={allCompletedSelected}
                    onChange={handleSelectAllToggle}
                    disabled={completedTracks.length === 0}
                    className="w-5 h-5 accent-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-dark disabled:cursor-not-allowed"
                  />
                  <label htmlFor="select-all" className="text-gray-300 cursor-pointer select-none">
                    Selecionar Todos
                  </label>
              </div>
            </div>
          </div>
        </footer>
      </div>
      {isDirectorModalOpen && (
        <DirectorModeModal 
          isOpen={isDirectorModalOpen}
          onClose={() => setIsDirectorModalOpen(false)}
          onSubmit={handleGenerateScript}
        />
      )}
      {isSequencerModalOpen && (
        <SequencerModal
          isOpen={isSequencerModalOpen}
          onClose={() => setIsSequencerModalOpen(false)}
          tracks={tracks.filter(t => t.status === 'completed' && t.includeInMaster)}
          onFinalize={handleFinalizeAndDownload}
          isProcessing={isCombining}
        />
      )}
    </>
  );
};

export default App;
