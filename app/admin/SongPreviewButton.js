"use client";

import { useAudio } from "../components/AudioProvider";
import styles from "./Admin.module.css";

// A little play/pause button to preview a song without leaving the admin
// form — reuses the site's shared audio player so only one preview (or
// envelope background song) ever plays at once.
export default function SongPreviewButton({ src, label }) {
  const { activeSrc, isPlaying, toggleHighlight } = useAudio();
  if (!src) return null;
  const playing = activeSrc === src && isPlaying;

  return (
    <button
      type="button"
      className={`${styles.previewBtn} ${playing ? styles.previewBtnPlaying : ""}`}
      onClick={() => toggleHighlight(src)}
      aria-label={playing ? `Pause ${label || "song"}` : `Play ${label || "song"}`}
      title={playing ? "Pause preview" : "Preview this song"}
    >
      {playing ? "❚❚" : "▶"}
    </button>
  );
}
