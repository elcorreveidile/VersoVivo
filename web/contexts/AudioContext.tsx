'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

type AudioType = 'voice' | 'music' | 'video' | null;

interface AudioContextType {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentUrl: string | null;
  currentType: AudioType;
  currentPoemId: string | null;

  // Actions
  play: (url: string, type: AudioType, poemId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;

  // Helpers
  isCurrentAudio: (url: string) => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<AudioType>(null);
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Create audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update current time while playing
  useEffect(() => {
    if (isPlaying) {
      const updateTime = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
        animationFrameRef.current = requestAnimationFrame(updateTime);
      };
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    setIsPlaying(false);
  }, []);

  const play = useCallback((url: string, type: AudioType, poemId: string) => {
    if (!audioRef.current) return;

    // Si es el mismo audio, solo resume
    if (currentUrl === url) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
      return;
    }

    // Nuevo audio: detener el actual y cargar el nuevo
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.load();

    setCurrentUrl(url);
    setCurrentType(type);
    setCurrentPoemId(poemId);
    setCurrentTime(0);

    audioRef.current.play().catch(err => console.error('Play error:', err));
    setIsPlaying(true);
  }, [currentUrl]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentUrl) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
    }
  }, [currentUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentUrl(null);
      setCurrentType(null);
      setCurrentPoemId(null);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const isCurrentAudio = useCallback((url: string) => {
    return currentUrl === url;
  }, [currentUrl]);

  const value: AudioContextType = {
    isPlaying,
    currentTime,
    duration,
    currentUrl,
    currentType,
    currentPoemId,
    play,
    pause,
    resume,
    stop,
    seek,
    isCurrentAudio,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
