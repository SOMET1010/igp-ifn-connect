import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Polling pour détecter si speechSynthesis parle
  useEffect(() => {
    const checkSpeaking = () => {
      if ('speechSynthesis' in window) {
        setIsPlaying(window.speechSynthesis.speaking);
      }
    };

    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, stop }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
};
