import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    language = 'ar-SA',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const interimRef = useRef('');

  // Check browser support
  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition !== undefined ||
      (window as any).webkitSpeechRecognition !== undefined);

  const isSupported = browserSupportsSpeechRecognition;

  // Initialize speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        interimRef.current = '';
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        interimRef.current = interim;
        setInterimTranscript(interim);

        if (final) {
          setTranscript((prev) => prev + final);
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = `خطأ في التعرف على الصوت: ${event.error}`;
        setError(errorMessage);
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        interimRef.current = '';
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [browserSupportsSpeechRecognition, continuous, interimResults, maxAlternatives, language]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !browserSupportsSpeechRecognition) {
      setError('المتصفح لا يدعم التعرف على الصوت');
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      setTranscript('');
      setInterimTranscript('');
      interimRef.current = '';
      setError(null);

      recognitionRef.current.start();
    } catch (err: any) {
      const errorMessage = `خطأ في الوصول للميكروفون: ${err.message}`;
      setError(errorMessage);
      console.error('Microphone error:', err);
    }
  }, [browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    interimRef.current = '';
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
};
