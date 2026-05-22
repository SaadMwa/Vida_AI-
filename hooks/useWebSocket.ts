'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface GenerationProgress {
  progress: number;
  stage: string;
  llmUsed: string | null;
  isGenerating: boolean;
  error: string | null;
  paperId: string | null;
  fallbackMessage: string | null;
  usedFallback: boolean;
}

export function useWebSocket(assignmentId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GenerationProgress>({
    progress: 0,
    stage: '',
    llmUsed: null,
    isGenerating: false,
    error: null,
    paperId: null,
    fallbackMessage: null,
    usedFallback: false,
  });

  const reset = useCallback(() => {
    setState({
      progress: 0,
      stage: '',
      llmUsed: null,
      isGenerating: true,
      error: null,
      paperId: null,
      fallbackMessage: null,
      usedFallback: false,
    });
  }, []);

  useEffect(() => {
    if (!assignmentId) return;

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(url);
    setSocket(newSocket);

    newSocket.emit('join', { assignmentId });

    newSocket.on('generation:started', () => {
      setState((s) => ({ ...s, isGenerating: true, error: null }));
    });

    newSocket.on('generation:progress', (data: { progress: number; stage: string }) => {
      setState((s) => ({
        ...s,
        progress: data.progress,
        stage: data.stage,
        isGenerating: true,
      }));
    });

    newSocket.on('generation:fallback', (data: { from: string; to: string; reason: string }) => {
      setState((s) => ({
        ...s,
        usedFallback: true,
        fallbackMessage: `OpenAI failed (${data.reason}). Trying ${data.to}...`,
      }));
    });

    newSocket.on('generation:completed', (data: { llmUsed: string; paperId: string }) => {
      setState((s) => ({
        ...s,
        llmUsed: data.llmUsed,
        paperId: data.paperId,
        progress: 100,
        stage: 'Complete',
        isGenerating: false,
      }));
    });

    newSocket.on('generation:failed', (data: { error: string }) => {
      setState((s) => ({
        ...s,
        error: data.error,
        isGenerating: false,
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [assignmentId]);

  return { socket, ...state, reset };
}
