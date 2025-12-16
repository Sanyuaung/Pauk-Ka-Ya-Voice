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

export const refineBurmeseText = async (text: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{
          text: `Refine the following Burmese text to be more grammatically correct, natural, and polite. Fix any potential spelling errors. 
          
          Original Text: "${text}"
          
          Return ONLY the refined Burmese text. No explanations.`
        }]
      }
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Refine error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  if (!text || !text.trim()) {
    throw new Error("Text is empty.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts || parts.length === 0) {
       throw new Error("No content received from TTS model.");
    }

    // 1. Try to find the audio part
    const audioPart = parts.find(p => p.inlineData && p.inlineData.data);
    if (audioPart?.inlineData?.data) {
      return audioPart.inlineData.data;
    }

    // 2. If no audio, check if the model returned a text message (refusal/error)
    const textPart = parts.find(p => p.text);
    if (textPart?.text) {
      console.warn("TTS Model returned text instead of audio:", textPart.text);
      // Clean up the error message
      const msg = textPart.text.length > 50 ? textPart.text.substring(0, 50) + "..." : textPart.text;
      throw new Error(`Model refused: ${msg}`);
    }

    throw new Error("No audio generated.");
  } catch (error: any) {
    console.error("TTS error:", error);
    // Propagate the specific error message if available
    throw new Error(error.message || "Failed to generate speech.");
  }
};