"use client";

import { useState } from "react";
import styles from "./page.module.css";
import EnvelopeStack from "./components/EnvelopeStack";
import LetterView from "./components/LetterView";
import RoadProgress from "./components/RoadProgress";
import { useAudio } from "./components/AudioProvider";
import { envelope1, TOTAL_ENVELOPES } from "./data/envelopes";

export default function Home() {
  const [openedIds, setOpenedIds] = useState(new Set());
  const [activeLetterId, setActiveLetterId] = useState(null);
  const { startBackground } = useAudio();

  const handleOpen = (id) => {
    if (id !== 1) return; // only envelope 1 has a letter so far

    setOpenedIds((prev) => new Set(prev).add(id));
    startBackground();

    // let the flap-opening animation play before the letter appears
    window.setTimeout(() => setActiveLetterId(id), 550);
  };

  const handleClose = () => setActiveLetterId(null);

  return (
    <main className={styles.main}>
      <EnvelopeStack openedIds={openedIds} onOpen={handleOpen} />
      <RoadProgress progress={openedIds.size / TOTAL_ENVELOPES} />
      {activeLetterId === 1 && (
        <LetterView envelope={envelope1} onClose={handleClose} />
      )}
    </main>
  );
}
