"use client";

import { useRef, useState } from "react";
import styles from "./VideoPlayer.module.css";

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = (Number(e.target.value) / 100) * duration;
    setCurrent(v.currentTime);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className={styles.wrap}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className={styles.video}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className={styles.bar}>
        <button
          type="button"
          className={`${styles.playBtn} ${playing ? styles.playing : ""}`}
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={duration ? (current / duration) * 100 : 0}
          onChange={seek}
          className={styles.seek}
          aria-label="Seek"
          style={{ "--fill": `${duration ? (current / duration) * 100 : 0}%` }}
        />
        <span className={styles.time}>
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          className={styles.muteBtn}
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
