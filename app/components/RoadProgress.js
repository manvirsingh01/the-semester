"use client";

import styles from "./RoadProgress.module.css";
import { useAudio } from "./AudioProvider";

function BoyFigure() {
  return (
    <svg viewBox="0 0 46 62">
      <g className={`${styles.leg} ${styles.legA}`}>
        <rect x="16" y="38" width="6" height="20" rx="3" fill="#3c4a63" />
      </g>
      <g className={`${styles.leg} ${styles.legB}`}>
        <rect x="24" y="38" width="6" height="20" rx="3" fill="#2c3850" />
      </g>
      <g className={styles.body}>
        <rect x="14" y="16" width="18" height="24" rx="6" fill="#7c8fae" />
        <circle cx="23" cy="9" r="8" fill="#c98a5e" />
        <circle cx="23" cy="9" r="8" fill="none" />
        <path d="M15 6 Q23 -2 31 6 Q31 2 23 1 Q15 2 15 6 Z" fill="#2e1c10" />
      </g>
    </svg>
  );
}

function GirlFigure() {
  return (
    <svg viewBox="0 0 46 62">
      <g className={styles.body}>
        <path
          className={styles.skirt}
          d="M23 24 L10 58 L36 58 Z"
          fill="#e0b23a"
        />
        <rect x="15" y="16" width="16" height="14" rx="5" fill="#a63d40" />
        <circle cx="23" cy="9" r="8" fill="#c98a5e" />
        <path d="M14 5 Q23 -3 32 5 Q33 12 29 14 Q26 6 23 6 Q20 6 17 14 Q13 12 14 5 Z" fill="#2e1c10" />
      </g>
    </svg>
  );
}

export default function RoadProgress({ restProgress, met, onMeet }) {
  const { activeSrc, isPlaying, backgroundSrc } = useAudio();
  const hoping = isPlaying && activeSrc && activeSrc !== backgroundSrc;

  const clamped = Math.min(1, Math.max(0, restProgress));
  const boyLeft = met ? 50 : 8 + clamped * 42;
  const girlLeft = met ? 50 : 92 - clamped * 42;

  return (
    <div className={styles.bar}>
      <div className={styles.roadBg} />
      <div className={styles.line} />
      <button
        type="button"
        className={`${styles.meet} ${met ? styles.close : ""}`}
        style={{ left: "50%" }}
        onClick={onMeet}
        aria-label={met ? "Send them back to walking" : "Make them meet"}
      >
        ♡
      </button>

      <div
        className={`${styles.figure} ${hoping ? styles.hoping : ""}`}
        style={{ left: `${boyLeft}%` }}
      >
        <div className={`${styles.figureInner} ${!met ? styles.pacing : ""}`}>
          <span className={styles.label}>him</span>
          <span className={styles.heart}>♥</span>
          <BoyFigure />
        </div>
      </div>

      <div className={styles.figure} style={{ left: `${girlLeft}%` }}>
        <div className={`${styles.figureInner} ${!met ? styles.pacing : ""}`}>
          <span className={styles.label}>her</span>
          <GirlFigure />
        </div>
      </div>
    </div>
  );
}
