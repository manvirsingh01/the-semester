"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import EnvelopeStack from "./EnvelopeStack";
import LetterView from "./LetterView";
import RoadProgress from "./RoadProgress";
import { useAudio } from "./AudioProvider";

// how close opening every envelope gets them, short of actually meeting —
// only clicking the heart closes that last stretch
const MAX_REST_PROGRESS = 0.85;

export default function HomeClient({ content }) {
  const [openedIds, setOpenedIds] = useState(new Set());
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [met, setMet] = useState(false);
  const { startBackground } = useAudio();

  const envelopes = content.envelopes;
  const totalEnvelopes = envelopes.length;
  const restProgress = Math.min(MAX_REST_PROGRESS, openedIds.size / totalEnvelopes);

  useEffect(() => {
    // Episode 9 is where they actually meet; every other envelope resets the walk
    setMet(activeLetterId === 9);
  }, [activeLetterId]);

  const handleMeet = () => setMet((m) => !m);

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
      <RoadProgress restProgress={restProgress} met={met} onMeet={handleMeet} />
      {activeEnvelope && <LetterView envelope={activeEnvelope} onClose={handleClose} />}
    </main>
  );
}
