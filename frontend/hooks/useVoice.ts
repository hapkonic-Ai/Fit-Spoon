'use client';

import { useRef, useState, useCallback } from 'react';

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  onFinal?: (text: string) => void;
  lang?: string;
}

export function useVoice({ onTranscript, onFinal, lang = 'en-US' }: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(text);
      onTranscript?.(text);

      const lastResult = e.results[e.results.length - 1];
      if (lastResult.isFinal) {
        onFinal?.(text);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript('');
  }, [isSupported, lang, onTranscript, onFinal]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, transcript, isSupported, start, stop, toggle };
}
