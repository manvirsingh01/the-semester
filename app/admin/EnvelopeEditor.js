"use client";

import styles from "./Admin.module.css";
import ParagraphEditor from "./ParagraphEditor";

export default function EnvelopeEditor({ envelope, songs, onChange }) {
  const updateField = (field, value) => onChange({ ...envelope, [field]: value });

  const updateParagraph = (idx, patch) => {
    const paragraphs = envelope.paragraphs.map((p, i) => (i === idx ? patch : p));
    onChange({ ...envelope, paragraphs });
  };

  const addParagraph = () =>
    onChange({ ...envelope, paragraphs: [...envelope.paragraphs, { text: "", highlights: [] }] });

  const removeParagraph = (idx) =>
    onChange({ ...envelope, paragraphs: envelope.paragraphs.filter((_, i) => i !== idx) });

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

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={!envelope.locked}
          onChange={(e) => updateField("locked", !e.target.checked)}
        />
        Unlocked (visitors can open this envelope on the site)
      </label>

      <h3 className={styles.cardTitle} style={{ marginTop: 22 }}>
        Paragraphs
      </h3>
      {envelope.paragraphs.length === 0 && (
        <p className={styles.hint}>No paragraphs yet — add the first one below.</p>
      )}
      {envelope.paragraphs.map((p, idx) => (
        <ParagraphEditor
          key={idx}
          index={idx}
          paragraph={p}
          songs={songs}
          onChange={(patch) => updateParagraph(idx, patch)}
          onRemove={() => removeParagraph(idx)}
        />
      ))}
      <button type="button" className={styles.btn} onClick={addParagraph}>
        + Add paragraph
      </button>
    </div>
  );
}
