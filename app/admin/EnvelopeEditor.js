"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import ParagraphEditor from "./ParagraphEditor";
import MediaEditor from "./MediaEditor";

export default function EnvelopeEditor({ envelope, songs, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const updateField = (field, value) => onChange({ ...envelope, [field]: value });

  const updateParagraph = (idx, patch) => {
    const paragraphs = envelope.paragraphs.map((p, i) => (i === idx ? patch : p));
    onChange({ ...envelope, paragraphs });
  };

  const addParagraph = () =>
    onChange({ ...envelope, paragraphs: [...envelope.paragraphs, { text: "", highlights: [] }] });

  const removeParagraph = (idx) =>
    onChange({ ...envelope, paragraphs: envelope.paragraphs.filter((_, i) => i !== idx) });

  const moveParagraph = (from, to) => {
    if (from === to) return;
    const paragraphs = [...envelope.paragraphs];
    const [moved] = paragraphs.splice(from, 1);
    paragraphs.splice(to, 0, moved);
    onChange({ ...envelope, paragraphs });
  };

  const clearDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Title</label>
          <input
            type="text"
            value={envelope.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <span className={styles.hint} style={{ margin: 0 }}>
            Shown below this envelope on the main page once it&apos;s unlocked.
          </span>
        </div>
        <div className={styles.field}>
          <label>Dateline</label>
          <input
            type="text"
            value={envelope.dateline}
            onChange={(e) => updateField("dateline", e.target.value)}
            placeholder="Tuesday, 15 August 2025"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Sign-off line</label>
        <input
          type="text"
          value={envelope.signOff}
          onChange={(e) => updateField("signOff", e.target.value)}
          placeholder="— to be continued, Episode 2 is coming"
        />
      </div>

      <div className={styles.field}>
        <label>Background song</label>
        <select
          value={envelope.backgroundSong || ""}
          onChange={(e) => updateField("backgroundSong", e.target.value)}
        >
          <option value="">no background song</option>
          {songs.map((s) => (
            <option key={s.url} value={s.url}>
              {s.name}
            </option>
          ))}
        </select>
        <span className={styles.hint} style={{ margin: 0 }}>
          Plays while this envelope&apos;s letter is open — each envelope can have its own song.
        </span>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={!envelope.locked}
          onChange={(e) => updateField("locked", !e.target.checked)}
        />
        Unlocked (visitors can open this envelope on the site)
      </label>
      <p className={styles.hint} style={{ marginTop: 4 }}>
        This envelope unlocks itself automatically once it has at least one paragraph and you hit
        Save on it — you don&apos;t need to check this by hand. Other envelopes you&apos;ve
        pre-written stay hidden until you open and save each one yourself.
      </p>

      <h3 className={styles.cardTitle} style={{ marginTop: 22 }}>
        Paragraphs
      </h3>
      {envelope.paragraphs.length === 0 && (
        <p className={styles.hint}>No paragraphs yet — add the first one below.</p>
      )}
      {envelope.paragraphs.length > 1 && (
        <p className={styles.hint}>Drag a paragraph by its ⠿ handle to reorder it.</p>
      )}
      {envelope.paragraphs.map((p, idx) => (
        <ParagraphEditor
          key={idx}
          index={idx}
          paragraph={p}
          songs={songs}
          onChange={(patch) => updateParagraph(idx, patch)}
          onRemove={() => removeParagraph(idx)}
          isDragging={dragIndex === idx}
          isDragOver={overIndex === idx && dragIndex !== null && dragIndex !== idx}
          onDragHandleStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(idx));
            setDragIndex(idx);
          }}
          onDragHandleEnd={clearDrag}
          onCardDragOver={(e) => {
            if (dragIndex === null) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (overIndex !== idx) setOverIndex(idx);
          }}
          onCardDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) moveParagraph(dragIndex, idx);
            clearDrag();
          }}
        />
      ))}
      <button type="button" className={styles.btn} onClick={addParagraph}>
        + Add paragraph
      </button>

      <MediaEditor envelope={envelope} onChange={onChange} />
    </div>
  );
}
