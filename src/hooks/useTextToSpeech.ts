/**
 * Hook for text-to-speech using browser SpeechSynthesis API
 * with AI-cleaned text from the backend
 */
import { useState, useCallback, useRef } from 'react';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsLoading(true);

    try {
      // Get cleaned text from backend
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'TTS failed');
      }

      const data = await resp.json();
      const cleanedText = data.text || text;

      // Use browser's SpeechSynthesis
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'fa-IR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      // Try to find a Persian voice
      const voices = window.speechSynthesis.getVoices();
      const persianVoice = voices.find(v => v.lang.startsWith('fa')) 
        || voices.find(v => v.lang.startsWith('ar')) // Arabic as fallback
        || voices[0];
      if (persianVoice) utterance.voice = persianVoice;

      utterance.onstart = () => { setIsSpeaking(true); setIsLoading(false); };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => { setIsSpeaking(false); setIsLoading(false); };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS error:', e);
      setIsLoading(false);
      
      // Fallback: use raw text with browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isLoading };
}
