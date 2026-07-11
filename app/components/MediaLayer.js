"use client";

import { useRef, useState } from "react";
import styles from "./MediaLayer.module.css";
import VideoPlayer from "./VideoPlayer";
import ChatBlock from "./ChatBlock";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Renders envelope.media as an absolutely-positioned overlay on top of the
// letter's paragraph flow. In interactive mode (admin only) items can be
// dragged by their grip handle and resized by their corner handle; on the
// public site it's read-only (interactive=false, no onChange).
export default function MediaLayer({ media = [], interactive = false, onChange }) {
  const overlayRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const dragRef = useRef(null);

  const onDragMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === "move") {
      const dxPct = ((e.clientX - d.startX) / d.rect.width) * 100;
      const dyPct = ((e.clientY - d.startY) / d.rect.height) * 100;
      onChange(d.id, { x: clamp(d.origX + dxPct, 0, 100), y: clamp(d.origY + dyPct, 0, 100) });
    } else {
      const dxPct = ((e.clientX - d.startX) / d.rect.width) * 100;
      onChange(d.id, { width: clamp(d.origWidth + dxPct, 12, 90) });
    }
  };

  const onDragEnd = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
  };

  const startDrag = (e, item) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      id: item.id,
      mode: "move",
      rect: overlayRef.current.getBoundingClientRect(),
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
    };
    setSelectedId(item.id);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
  };

  const startResize = (e, item) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      id: item.id,
      mode: "resize",
      rect: overlayRef.current.getBoundingClientRect(),
      startX: e.clientX,
      origWidth: item.width,
    };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
  };

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={() => interactive && setSelectedId(null)}
    >
      {media.map((item) => {
        const selected = interactive && selectedId === item.id;
        return (
          <div
            key={item.id}
            className={`${styles.item} ${interactive ? styles.interactive : ""} ${
              selected ? styles.selected : ""
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%` }}
            onClick={(e) => {
              if (interactive) {
                e.stopPropagation();
                setSelectedId(item.id);
              }
            }}
          >
            {interactive && (
              <div
                className={styles.grip}
                onPointerDown={(e) => startDrag(e, item)}
                aria-label="Drag to move"
                title="Drag to move"
              >
                ⠿
              </div>
            )}

            {item.type === "image" && (
              <img src={item.url} alt={item.caption || ""} className={styles.image} draggable={false} />
            )}
            {item.type === "video" && <VideoPlayer src={item.url} />}
            {item.type === "chat" && <ChatBlock title={item.title} messages={item.messages} />}
            {item.caption && item.type !== "chat" && <p className={styles.caption}>{item.caption}</p>}

            {selected && (
              <>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(item.id, null);
                    setSelectedId(null);
                  }}
                  aria-label="Remove"
                  title="Remove"
                >
                  ×
                </button>
                <div
                  className={styles.resizeHandle}
                  onPointerDown={(e) => startResize(e, item)}
                  aria-label="Drag to resize"
                  title="Drag to resize"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
