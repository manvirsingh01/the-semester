"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { SONGS } from "../data/envelopes";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [activeKey, setActiveKey] = useState(null); // null | "background" | "rickshaw" | "yellowSari"
  const [isPlaying, setIsPlaying] = useState(false);
  const wasBackgroundStarted = useRef(false);

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

  const playKey = useCallback(
    (key) => {
      const el = getAudioEl();
      const src = SONGS[key];
      if (!src) return;
      if (activeKey !== key || el.src.indexOf(src) === -1) {
        el.src = src;
        el.currentTime = 0;
      }
      el.play().catch(() => {});
      setActiveKey(key);
      if (key === "background") wasBackgroundStarted.current = true;
    },
    [activeKey, getAudioEl]
  );

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (el) el.pause();
  }, []);

  // Starts the ambient theme — meant to be called from the first envelope
  // click, since that user gesture is what unlocks autoplay with sound.
  const startBackground = useCallback(() => {
    if (wasBackgroundStarted.current) return;
    playKey("background");
  }, [playKey]);

  // Highlighted-passage songs are exclusive: playing one always stops
  // whatever else was playing, and turning it back off returns to the
  // background theme rather than dead silence.
  const toggleHighlight = useCallback(
    (key) => {
      if (activeKey === key && isPlaying) {
        pause();
        playKey("background");
      } else {
        playKey(key);
      }
    },
    [activeKey, isPlaying, pause, playKey]
  );

  const value = {
    activeKey,
    isPlaying,
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
