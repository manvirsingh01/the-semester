"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import EnvelopeStack from "./EnvelopeStack";
import LetterView from "./LetterView";
import RoadProgress from "./RoadProgress";
import { useAudio } from "./AudioProvider";

export default function HomeClient({ content }) {
  const [openedIds, setOpenedIds] = useState(new Set());
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { startBackground } = useAudio();

  const envelopes = content.envelopes;
  const totalEnvelopes = envelopes.length;

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(measure);
        ticking = true;
      }
    };

    measure();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleMeet = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

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
        <LetterView envelope={activeEnvelope} onClose={handleClose} />
      )}
    </main>
  );
}
