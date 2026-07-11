"use client";

import styles from "./ChatBlock.module.css";

export default function ChatBlock({ title, messages = [] }) {
  return (
    <div className={styles.wrap}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.thread}>
        {messages.length === 0 && <p className={styles.empty}>the conversation goes here</p>}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${m.from === "me" ? styles.me : styles.them}`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}
