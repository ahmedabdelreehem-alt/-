import { useEffect, useRef, useState, useCallback } from 'react';

interface UseTextToSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  error: string | null;
}

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn => {
  const {
    language = 'ar-SA',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && window.speechSynthesis !== undefined;

  // Initialize speech synthesis
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        setError('المتصفح لا يدعم تحويل النص إلى صوت');
        return;
      }

      try {
        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event: any) => {
          const errorMessage = `خطأ في تحويل النص إلى صوت: ${event.error}`;
          setError(errorMessage);
          setIsSpeaking(false);
          console.error('Speech synthesis error:', event.error);
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      } catch (err: any) {
        const errorMessage = `خطأ: ${err.message}`;
        setError(errorMessage);
        console.error('Text to speech error:', err);
      }
    },
    [language, rate, pitch, volume]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.resume();
    }
  }, [isSpeaking]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    error,
  };
};
