"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../page.module.css";
import EnvelopeStack from "./EnvelopeStack";
import LetterView from "./LetterView";
import RoadProgress from "./RoadProgress";
import { useAudio } from "./AudioProvider";

// how much of the journey a single letter's own scroll is worth, on top of
// the main page's scroll distance
const JOURNEY_PER_LETTER = 600;

export default function HomeClient({ content }) {
  const [openedIds, setOpenedIds] = useState(new Set());
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { startBackground } = useAudio();

  const envelopes = content.envelopes;
  const totalEnvelopes = envelopes.length;
  const writtenCount = envelopes.filter((e) => !e.locked && e.paragraphs.length > 0).length;

  // journeyPx accumulates across both the main page scroll and, once a
  // letter is open, that letter's own internal scroll — so opening an
  // envelope continues the walk instead of resetting it.
  const journeyPxRef = useRef(0);
  const journeyTotalRef = useRef(1);
  const lastWindowScrollRef = useRef(0);
  const letterSheetRef = useRef(null);
  const activeLetterIdRef = useRef(activeLetterId);
  activeLetterIdRef.current = activeLetterId;

  useEffect(() => {
    // re-baseline so any window scroll ignored while a letter was open
    // (or vice versa) can't inject a spurious jump once tracking resumes
    lastWindowScrollRef.current = window.scrollY;
  }, [activeLetterId]);

  const applyProgress = () => {
    const p = journeyPxRef.current / journeyTotalRef.current;
    setScrollProgress(Math.min(1, Math.max(0, p)));
  };

  useEffect(() => {
    const measureTotal = () => {
      const mainScrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      journeyTotalRef.current = Math.max(1, mainScrollable + writtenCount * JOURNEY_PER_LETTER);
      applyProgress();
    };

    let ticking = false;
    const onWindowScroll = () => {
      if (activeLetterIdRef.current != null) return;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastWindowScrollRef.current;
        lastWindowScrollRef.current = y;
        journeyPxRef.current += delta;
        applyProgress();
        ticking = false;
      });
    };

    measureTotal();
    lastWindowScrollRef.current = window.scrollY;
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", measureTotal);
    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", measureTotal);
    };
  }, [writtenCount]);

  const handleLetterScrollDelta = useCallback((delta) => {
    journeyPxRef.current += delta;
    setScrollProgress(
      Math.min(1, Math.max(0, journeyPxRef.current / journeyTotalRef.current))
    );
  }, []);

  const handleMeet = useCallback(() => {
    if (activeLetterIdRef.current != null && letterSheetRef.current) {
      letterSheetRef.current.scrollTo({
        top: letterSheetRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleOpen = (id) => {
    const envelope = envelopes.find((e) => e.id === id);
    if (!envelope || envelope.locked || envelope.paragraphs.length === 0) return;

    setOpenedIds((prev) => new Set(prev).add(id));
    startBackground(envelope.backgroundSong);

    // let the flap-opening animation play before the letter appears
    window.setTimeout(() => setActiveLetterId(id), 550);
  };

  const handleClose = () => setActiveLetterId(null);

  const activeEnvelope = envelopes.find((e) => e.id === activeLetterId);

  return (
    <main className={styles.main}>
      <EnvelopeStack
        envelopes={envelopes}
        site={content.site}
        openedIds={openedIds}
        onOpen={handleOpen}
      />
      <div className={styles.roadSpacer} />
      <RoadProgress progress={scrollProgress} onMeet={handleMeet} />
      {activeEnvelope && (
        <LetterView
          envelope={activeEnvelope}
          onClose={handleClose}
          sheetRef={letterSheetRef}
          onScrollDelta={handleLetterScrollDelta}
        />
      )}
    </main>
  );
}
