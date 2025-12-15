import { GoogleGenAI } from "@google/genai";
import { blobToBase64 } from "../utils/audioHelper";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Transcribe the following audio exactly into Burmese (Myanmar) text. Return ONLY the transcribed text. Do not provide any translation, intro, or markdown formatting. The output should be formatted as a natural paragraph."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No transcription generated.");
    }

    return text.trim();
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio generated.");
    }
    return base64Audio;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};