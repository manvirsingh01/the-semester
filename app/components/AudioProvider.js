"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [activeSrc, setActiveSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backgroundSrc, setBackgroundSrc] = useState(null);
  const backgroundStarted = useRef(false);

  const getAudioEl = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.55;
      audioRef.current.addEventListener("pause", () => setIsPlaying(false));
      audioRef.current.addEventListener("play", () => setIsPlaying(true));
    }
    return audioRef.current;
  }, []);

  const playSrc = useCallback(
    (src) => {
      if (!src) return;
      const el = getAudioEl();
      if (activeSrc !== src || el.src.indexOf(src) === -1) {
        el.src = src;
        el.currentTime = 0;
      }
      el.play().catch(() => {});
      setActiveSrc(src);
    },
    [activeSrc, getAudioEl]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // Starts the ambient theme — meant to be called from the first envelope
  // click, since that user gesture is what unlocks autoplay with sound.
  const startBackground = useCallback(
    (src) => {
      setBackgroundSrc(src);
      if (backgroundStarted.current) return;
      backgroundStarted.current = true;
      playSrc(src);
    },
    [playSrc]
  );

  // Highlighted-passage songs are exclusive: playing one always stops
  // whatever else was playing, and turning it back off returns to the
  // background theme rather than dead silence.
  const toggleHighlight = useCallback(
    (src) => {
      if (activeSrc === src && isPlaying) {
        pause();
        if (backgroundSrc) playSrc(backgroundSrc);
      } else {
        playSrc(src);
      }
    },
    [activeSrc, isPlaying, pause, playSrc, backgroundSrc]
  );

  const value = {
    activeSrc,
    isPlaying,
    backgroundSrc,
    startBackground,
    toggleHighlight,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
