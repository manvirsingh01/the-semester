"use client";

import { useEffect } from "react";
import styles from "./LetterView.module.css";
import { useAudio } from "./AudioProvider";
import { buildSegments } from "../../lib/letter";

function HighlightSegment({ text, song }) {
  const { activeSrc, isPlaying, toggleHighlight } = useAudio();
  const isActive = activeSrc === song && isPlaying;

  return (
    <span className={styles.highlightWrap}>
      <span className={styles.hintBox}>
        <button
          type="button"
          className={`${styles.noteBtn} ${isActive ? styles.playing : ""}`}
          onClick={() => toggleHighlight(song)}
          aria-label={isActive ? "Pause this song" : "Play the song for this moment"}
          title={isActive ? "Pause" : "Play the song for this moment"}
        >
          {isActive ? "❚❚" : "▶"}
        </button>
        <span className={styles.hintText}>
          <span className={styles.volIcon} aria-hidden="true">
            🔊
          </span>
          turn up the volume
        </span>
      </span>
      <mark
        className={`${styles.highlight} ${isActive ? styles.revealed : styles.blurred}`}
        onClick={() => !isActive && toggleHighlight(song)}
      >
        {text}
      </mark>
    </span>
  );
}

export default function LetterView({ envelope, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close letter"
        >
          ×
        </button>
        <p className={styles.dateline}>{envelope.dateline}</p>
        <h2 className={styles.heading}>{envelope.title}</h2>
        <div className={styles.body}>
          {envelope.paragraphs.map((paragraph, pIdx) => (
            <p className={styles.paragraph} key={pIdx}>
              {buildSegments(paragraph).map((seg, sIdx) =>
                seg.song ? (
                  <HighlightSegment key={sIdx} text={seg.text} song={seg.song} />
                ) : (
                  <span key={sIdx}>{seg.text}</span>
                )
              )}
            </p>
          ))}
        </div>
        {envelope.signOff && <p className={styles.signOff}>{envelope.signOff}</p>}
      </div>
    </div>
  );
}
