"use client";

import Envelope from "./Envelope";
import styles from "./EnvelopeStack.module.css";

export default function EnvelopeStack({ envelopes, site, openedIds, onOpen }) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{site.title}</h1>
        <p className={styles.subtitle}>{site.subtitle}</p>
      </div>

      <div className={styles.grid}>
        {envelopes.map((env) => (
          <Envelope
            key={env.id}
            id={env.id}
            title={env.title}
            opened={openedIds.has(env.id)}
            locked={env.locked || env.paragraphs.length === 0}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
