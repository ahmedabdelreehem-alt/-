import { useState, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { InteractiveAvatar } from '@/components/InteractiveAvatar';
import axios from 'axios';

export default function Home() {
  const [response, setResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: 'ar-SA',
    continuous: false,
    interimResults: true,
  });

  // Text to Speech Hook
  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    error: ttsError,
  } = useTextToSpeech({
    language: 'ar-SA',
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  // Handle microphone click
  const handleMicClick = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setResponse('');
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  // Handle stop click
  const handleStopClick = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [isListening, isSpeaking, stopListening, stopSpeaking]);

  // Process transcript when listening stops
  const handleTranscriptComplete = useCallback(async () => {
    if (transcript.trim() && !isListening && !isProcessing) {
      setIsProcessing(true);
      try {
        // Here you would call your API to get the response
        // For now, we'll just echo the transcript as a demo
        const demoResponse = `تم استقبال: "${transcript}". هذا رد تجريبي من الأفاتار.`;
        setResponse(demoResponse);
        
        // Speak the response
        speak(demoResponse);
      } catch (error) {
        console.error('Error processing transcript:', error);
        const errorMessage = 'حدث خطأ في معالجة الطلب';
        setResponse(errorMessage);
        speak(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [transcript, isListening, isProcessing, speak]);

  // Trigger processing when listening stops and transcript is available
  if (!isListening && transcript && !isProcessing && !response) {
    handleTranscriptComplete();
  }

  const error = speechError || ttsError;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            🤖 الرايق أفاتار مصر
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            تطبيق ذكي تفاعلي يستجيب للأوامر الصوتية
          </p>
        </div>

        {/* Interactive Avatar */}
        <InteractiveAvatar
          isListening={isListening}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          onMicClick={handleMicClick}
          onStopClick={handleStopClick}
          transcript={transcript}
          interimTranscript={interimTranscript}
          error={error}
          response={response}
        />

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-2">🎤</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">التعرف على الصوت</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              استخدم الميكروفون لإرسال أوامرك الصوتية بالعربية
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">الذكاء الاصطناعي</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              الأفاتار يفهم طلبك ويرد عليك بذكاء
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl mb-2">🔊</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">تحويل النص إلى صوت</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              استمع إلى رد الأفاتار بصوت واضح وطبيعي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
