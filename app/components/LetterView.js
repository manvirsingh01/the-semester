"use client";

import { useEffect } from "react";
import styles from "./LetterView.module.css";
import { useAudio } from "./AudioProvider";

function HighlightSegment({ text, highlightKey }) {
  const { activeKey, isPlaying, toggleHighlight } = useAudio();
  const isActive = activeKey === highlightKey && isPlaying;

  return (
    <span className={styles.highlightWrap}>
      <mark className={`${styles.highlight} ${isActive ? styles.active : ""}`}>
        {text}
      </mark>
      <button
        type="button"
        className={`${styles.noteBtn} ${isActive ? styles.playing : ""}`}
        onClick={() => toggleHighlight(highlightKey)}
        aria-label={isActive ? "Pause this song" : "Play the song for this moment"}
        title={isActive ? "Pause" : "Play the song for this moment"}
      >
        {isActive ? "❚❚" : "▶"}
      </button>
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
          {envelope.paragraphs.map((segments, pIdx) => (
            <p className={styles.paragraph} key={pIdx}>
              {segments.map((seg, sIdx) =>
                seg.highlight ? (
                  <HighlightSegment
                    key={sIdx}
                    text={seg.text}
                    highlightKey={seg.highlight}
                  />
                ) : (
                  <span key={sIdx}>{seg.text}</span>
                )
              )}
            </p>
          ))}
        </div>
        <p className={styles.signOff}>— to be continued, Episode 2 is coming</p>
      </div>
    </div>
  );
}
