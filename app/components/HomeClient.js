"use client";

import { useState } from "react";
import styles from "../page.module.css";
import EnvelopeStack from "./EnvelopeStack";
import LetterView from "./LetterView";
import RoadProgress from "./RoadProgress";
import { useAudio } from "./AudioProvider";

export default function HomeClient({ content }) {
  const [openedIds, setOpenedIds] = useState(new Set());
  const [activeLetterId, setActiveLetterId] = useState(null);
  const { startBackground } = useAudio();

  const envelopes = content.envelopes;
  const totalEnvelopes = envelopes.length;

  const handleOpen = (id) => {
    const envelope = envelopes.find((e) => e.id === id);
    if (!envelope || envelope.locked || envelope.paragraphs.length === 0) return;

    setOpenedIds((prev) => new Set(prev).add(id));
    startBackground(content.site.backgroundSong);

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
      <RoadProgress progress={openedIds.size / totalEnvelopes} />
      {activeEnvelope && (
        <LetterView envelope={activeEnvelope} onClose={handleClose} />
      )}
    </main>
  );
}
