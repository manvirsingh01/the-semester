"use client";

import styles from "./Envelope.module.css";

export default function Envelope({ id, locked, opened, onOpen }) {
  const tilt = locked || opened ? 0 : ((id % 5) - 2) * 1.6;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.envelope} ${opened ? styles.opened : ""} ${
          locked ? styles.locked : ""
        }`}
        style={{ "--tilt": `${tilt}deg` }}
        onClick={() => !locked && onOpen(id)}
        disabled={locked}
        aria-label={locked ? `Envelope ${id}, locked` : `Open envelope ${id}`}
      >
        <div className={styles.body}>
          <div className={styles.letterPeek} />
          <div className={styles.flap} />
          {locked ? (
            <span className={styles.lockBadge} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
                <path
                  d="M8 11V8a4 4 0 0 1 8 0v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
          ) : (
            <div className={styles.seal}>♡</div>
          )}
          <span className={styles.number}>{id}</span>
        </div>
      </button>
      <span className={styles.label}>
        {locked ? "not written yet" : opened ? "read again" : "open me"}
      </span>
    </div>
  );
}
