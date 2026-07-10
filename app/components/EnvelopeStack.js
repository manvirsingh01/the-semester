"use client";

import Envelope from "./Envelope";
import styles from "./EnvelopeStack.module.css";
import { TOTAL_ENVELOPES } from "../data/envelopes";

export default function EnvelopeStack({ openedIds, onOpen }) {
  const ids = Array.from({ length: TOTAL_ENVELOPES }, (_, i) => i + 1);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h1 className={styles.title}>The Semester</h1>
        <p className={styles.subtitle}>ten envelopes, one story, kept for you</p>
      </div>

      <div className={styles.grid}>
        {ids.map((id) => (
          <Envelope
            key={id}
            id={id}
            opened={openedIds.has(id)}
            locked={id !== 1}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
