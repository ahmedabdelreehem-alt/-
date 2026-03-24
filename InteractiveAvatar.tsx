import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InteractiveAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onMicClick: () => void;
  onStopClick: () => void;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  response?: string;
}

type AvatarExpression = 'neutral' | 'listening' | 'speaking' | 'thinking';

export const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  onMicClick,
  onStopClick,
  transcript,
  interimTranscript,
  error,
  response,
}) => {
  const [avatarExpression, setAvatarExpression] = useState<AvatarExpression>('neutral');

  useEffect(() => {
    if (isProcessing) {
      setAvatarExpression('thinking');
    } else if (isSpeaking) {
      setAvatarExpression('speaking');
    } else if (isListening) {
      setAvatarExpression('listening');
    } else {
      setAvatarExpression('neutral');
    }
  }, [isListening, isSpeaking, isProcessing]);

  const getAvatarBgClass = () => {
    switch (avatarExpression) {
      case 'listening':
        return 'bg-blue-500 shadow-lg shadow-blue-400 scale-105';
      case 'speaking':
        return 'bg-green-500 shadow-lg shadow-green-400 animate-pulse';
      case 'thinking':
        return 'bg-purple-500 shadow-lg shadow-purple-400';
      default:
        return 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg';
    }
  };

  const getStatusText = () => {
    switch (avatarExpression) {
      case 'listening':
        return '🎤 استمع...';
      case 'speaking':
        return '🔊 يتحدث...';
      case 'thinking':
        return '🤔 يفكر...';
      default:
        return 'اضغط على الميكروفون للبدء';
    }
  };

  const getAvatarIcon = () => {
    switch (avatarExpression) {
      case 'listening':
        return <Mic className="w-12 h-12 animate-bounce" />;
      case 'speaking':
        return <Volume2 className="w-12 h-12" />;
      case 'thinking':
        return <Loader2 className="w-12 h-12 animate-spin" />;
      default:
        return <span className="text-4xl">🤖</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-200 dark:border-slate-700">
        {/* Avatar Visual */}
        <div className="flex justify-center mb-8">
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${getAvatarBgClass()}`}>
            <div className="text-white">
              {getAvatarIcon()}
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            الرايق أفاتار مصر
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {getStatusText()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="mb-6 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">ما قلته:</p>
            <p className="text-slate-900 dark:text-white">
              {transcript}
              <span className="text-slate-400 dark:text-slate-500 italic">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">الرد:</p>
            <p className="text-slate-900 dark:text-white">{response}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={onMicClick}
            disabled={isProcessing}
            className={`px-8 py-6 rounded-full font-semibold text-lg transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                إيقاف الاستماع
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                ابدأ الاستماع
              </>
            )}
          </Button>

          {(isSpeaking || isProcessing) && (
            <Button
              onClick={onStopClick}
              className="px-8 py-6 rounded-full font-semibold text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all"
            >
              <VolumeX className="w-5 h-5 mr-2" />
              إيقاف
            </Button>
          )}
        </div>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">جاري المعالجة...</span>
        </div>
      )}
    </div>
  );
};
