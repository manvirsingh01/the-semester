"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import letterStyles from "../components/LetterView.module.css";
import MediaLayer from "../components/MediaLayer";
import { buildSegments } from "../../lib/letter";
import styles from "./LivePreview.module.css";
import PreviewRoad from "./PreviewRoad";

export default function LivePreview({ envelope, onMediaChange }) {
  const panelRef = useRef(null);
  const [roadProgress, setRoadProgress] = useState(0);

  const measureProgress = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    const p = scrollable > 0 ? el.scrollTop / scrollable : 0;
    setRoadProgress(Math.min(1, Math.max(0, p)));
  }, []);

  useEffect(() => {
    // envelope switched — the panel's content changed height, so re-measure
    measureProgress();
  }, [envelope, measureProgress]);

  const handleMeet = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  if (!envelope) return null;

  return (
    <div className={styles.panel} ref={panelRef} onScroll={measureProgress}>
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
      <PreviewRoad progress={roadProgress} onMeet={handleMeet} />
    </div>
  );
}
