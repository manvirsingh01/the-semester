"use client";

import letterStyles from "../components/LetterView.module.css";
import MediaLayer from "../components/MediaLayer";
import { buildSegments } from "../../lib/letter";
import styles from "./LivePreview.module.css";
import PreviewRoad from "./PreviewRoad";

export default function LivePreview({ envelope, onMediaChange }) {
  if (!envelope) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Live preview</div>
      <p className={styles.hint}>
        This mirrors the envelope page. Drag the ⠿ grip to move a photo, video, or chat; once
        selected, drag its corner dot to resize, or tap × to remove it.
      </p>
      <div className={styles.frame}>
        <div className={letterStyles.sheet} style={{ maxHeight: "none", animation: "none" }}>
          <p className={letterStyles.dateline}>{envelope.dateline}</p>
          <h2 className={letterStyles.heading}>{envelope.title}</h2>
          <div className={letterStyles.canvas}>
            <div className={letterStyles.body}>
              {envelope.paragraphs.map((paragraph, pIdx) => (
                <p className={letterStyles.paragraph} key={pIdx}>
                  {buildSegments(paragraph).map((seg, sIdx) =>
                    seg.song ? (
                      <mark key={sIdx} className={letterStyles.highlight}>
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={sIdx}>{seg.text}</span>
                    )
                  )}
                </p>
              ))}
            </div>
            <MediaLayer media={envelope.media ?? []} interactive onChange={onMediaChange} />
          </div>
          {envelope.signOff && <p className={letterStyles.signOff}>{envelope.signOff}</p>}
        </div>
      </div>
      <PreviewRoad />
    </div>
  );
}
