import { useState, useCallback, useEffect } from 'react';

export const useDuaSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDuaId, setCurrentDuaId] = useState<string | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((duaId: string, arabicText: string, translation: string) => {
    // If already speaking the same dua, stop it
    if (isSpeaking && currentDuaId === duaId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentDuaId(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance for Arabic text
    const arabicUtterance = new SpeechSynthesisUtterance(arabicText);
    arabicUtterance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    arabicUtterance.rate = 0.8; // Slightly slower for clarity
    arabicUtterance.pitch = 1;

    // Create utterance for translation
    const translationUtterance = new SpeechSynthesisUtterance(translation);
    translationUtterance.lang = 'en-US';
    translationUtterance.rate = 0.9;
    translationUtterance.pitch = 1;

    // Set up event handlers
    arabicUtterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentDuaId(duaId);
    };

    translationUtterance.onend = () => {
      setIsSpeaking(false);
      setCurrentDuaId(null);
    };

    translationUtterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentDuaId(null);
    };

    arabicUtterance.onerror = () => {
      // If Arabic fails, try just the translation
      window.speechSynthesis.speak(translationUtterance);
    };

    arabicUtterance.onend = () => {
      // After Arabic, speak the translation
      window.speechSynthesis.speak(translationUtterance);
    };

    // Start speaking Arabic first
    window.speechSynthesis.speak(arabicUtterance);
  }, [isSpeaking, currentDuaId]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentDuaId(null);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    currentDuaId,
  };
};
