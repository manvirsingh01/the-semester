"use client";

import { useRef } from "react";
import styles from "./Admin.module.css";
import { buildSegments } from "../../lib/letter";
import SongPreviewButton from "./SongPreviewButton";

export default function ParagraphEditor({
  index,
  paragraph,
  songs,
  onChange,
  onRemove,
  isDragging,
  isDragOver,
  onDragHandleStart,
  onDragHandleEnd,
  onCardDragOver,
  onCardDrop,
}) {
  const textareaRef = useRef(null);

  const handleTextChange = (e) => onChange({ ...paragraph, text: e.target.value });

  const handleAddHighlight = () => {
    const el = textareaRef.current;
    if (!el) return;
    const phrase = paragraph.text.slice(el.selectionStart, el.selectionEnd).trim();
    if (!phrase) {
      alert('Select a phrase inside the text above first, then click "Highlight selection".');
      return;
    }
    onChange({
      ...paragraph,
      highlights: [...paragraph.highlights, { phrase, song: songs[0]?.url || "" }],
    });
  };

  const updateHighlight = (hIdx, patch) => {
    const highlights = paragraph.highlights.map((h, i) => (i === hIdx ? { ...h, ...patch } : h));
    onChange({ ...paragraph, highlights });
  };

  const removeHighlight = (hIdx) => {
    onChange({ ...paragraph, highlights: paragraph.highlights.filter((_, i) => i !== hIdx) });
  };

  const segments = buildSegments(paragraph);

  return (
    <div
      className={`${styles.paragraphCard} ${isDragging ? styles.paragraphDragging : ""} ${
        isDragOver ? styles.paragraphDragOver : ""
      }`}
      onDragOver={onCardDragOver}
      onDrop={onCardDrop}
    >
      <div className={styles.paragraphHead}>
        <span className={styles.paragraphIndex}>
          <span
            className={styles.dragGrip}
            draggable
            onDragStart={onDragHandleStart}
            onDragEnd={onDragHandleEnd}
            title="Drag to reorder"
            aria-label="Drag to reorder"
          >
            ⠿
          </span>
          Paragraph {index + 1}
        </span>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
          onClick={onRemove}
        >
          Remove paragraph
        </button>
      </div>

      <textarea ref={textareaRef} value={paragraph.text} onChange={handleTextChange} />

      <p className={styles.hint}>
        Select a phrase in the text above, then click below to turn it into a highlight tied to a
        song.
      </p>
      <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={handleAddHighlight}>
        + Highlight selection
      </button>

      {paragraph.highlights.length > 0 && (
        <div className={styles.highlightList}>
          {paragraph.highlights.map((h, hIdx) => (
            <div className={styles.highlightRow} key={hIdx}>
              <span className={styles.highlightPhrase}>
                “{h.phrase.length > 90 ? h.phrase.slice(0, 90) + "…" : h.phrase}”
              </span>
              <select value={h.song} onChange={(e) => updateHighlight(hIdx, { song: e.target.value })}>
                <option value="">choose a song…</option>
                {songs.map((s) => (
                  <option key={s.url} value={s.url}>
                    {s.name}
                  </option>
                ))}
              </select>
              <SongPreviewButton src={h.song} label={songs.find((s) => s.url === h.song)?.name} />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                onClick={() => removeHighlight(hIdx)}
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.preview}>
        {segments.map((seg, i) =>
          seg.song ? (
            <mark key={i} className={styles.previewMark}>
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    </div>
  );
}
