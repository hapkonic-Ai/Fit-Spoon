'use client';

import { useRef, useState, useCallback } from 'react';
import api from '@/lib/api';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch {
      setError('Camera access denied. Please check your browser permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsActive(false);
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      const formData = new FormData();
      formData.append('image', base64);

      const res = await api.post<{ detectedIngredients: string[] }>('/fridge/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDetectedIngredients(res.data.detectedIngredients);
      stopCamera();
    } catch {
      setError('Could not analyze image. Please try again or type ingredients manually.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    isAnalyzing,
    detectedIngredients,
    error,
    startCamera,
    stopCamera,
    captureAndAnalyze,
  };
}
