import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ScriptLine } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error("Failed to generate speech via Gemini API.");
  }
};

export const generateScript = async (prompt: string, numCharacters: number): Promise<ScriptLine[]> => {
  try {
    const fullPrompt = `Você é um roteirista de podcasts. Sua tarefa é criar um diálogo interativo para ${numCharacters} participantes de um podcast. O tema da discussão é: "${prompt}".
O diálogo deve apresentar opiniões alternadas e contrastantes, como um debate animado.
Os participantes devem ser numerados de 1 a ${numCharacters}.
A conversa deve fluir naturalmente.
Responda APENAS com o JSON que corresponde ao schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dialogue: {
              type: Type.ARRAY,
              description: "A lista de falas do diálogo.",
              items: {
                type: Type.OBJECT,
                properties: {
                  character: {
                    type: Type.INTEGER,
                    description: `O número do personagem que está falando (de 1 a ${numCharacters}).`,
                  },
                  line: {
                    type: Type.STRING,
                    description: "O texto da fala do personagem.",
                  },
                },
                required: ["character", "line"],
              },
            },
          },
          required: ["dialogue"],
        },
      },
    });

    const jsonString = response.text;
    if (!jsonString) {
      throw new Error("A API retornou uma resposta vazia.");
    }

    const parsed = JSON.parse(jsonString);

    if (!parsed.dialogue || !Array.isArray(parsed.dialogue)) {
      throw new Error("A resposta da API não continha um diálogo válido no formato esperado.");
    }

    return parsed.dialogue as ScriptLine[];
  } catch (error) {
    console.error("Error in generateScript:", error);
    const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    throw new Error(`Falha ao gerar o roteiro: ${message}. Verifique se sua chave de API (API Key) está configurada corretamente e se o projeto tem faturamento ativo.`);
  }
};