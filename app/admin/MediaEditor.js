"use client";

import { useState } from "react";
import styles from "./Admin.module.css";

const newId = () => `m${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

export default function MediaEditor({ envelope, onChange }) {
  const media = envelope.media || [];
  const [uploading, setUploading] = useState(null); // "image" | "video" | null

  const setMedia = (next) => onChange({ ...envelope, media: next });
  const addItem = (item) => setMedia([...media, item]);
  const updateItem = (id, patch) => setMedia(media.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeItem = (id) => setMedia(media.filter((m) => m.id !== id));

  const upload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      addItem({
        id: newId(),
        type,
        url: data.url,
        x: 50,
        y: 50,
        width: type === "video" ? 45 : 32,
        caption: "",
      });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const addChat = () =>
    addItem({ id: newId(), type: "chat", x: 50, y: 50, width: 38, title: "", messages: [] });

  const addMessage = (chatId) => {
    const chat = media.find((m) => m.id === chatId);
    updateItem(chatId, { messages: [...chat.messages, { from: "them", text: "" }] });
  };

  const updateMessage = (chatId, mIdx, patch) => {
    const chat = media.find((m) => m.id === chatId);
    const messages = chat.messages.map((msg, i) => (i === mIdx ? { ...msg, ...patch } : msg));
    updateItem(chatId, { messages });
  };

  const removeMessage = (chatId, mIdx) => {
    const chat = media.find((m) => m.id === chatId);
    updateItem(chatId, { messages: chat.messages.filter((_, i) => i !== mIdx) });
  };

  return (
    <div>
      <h3 className={styles.cardTitle} style={{ marginTop: 22 }}>
        Photos, videos &amp; chats
      </h3>
      <p className={styles.hint}>
        Add items here, then drag them by their grip handle and resize them from the corner in the
        live preview on the right to place them anywhere on the letter.
      </p>

      <div className={styles.songManager} style={{ marginBottom: 16 }}>
        <label className={styles.btn} style={{ cursor: "pointer" }}>
          {uploading === "image" ? "Uploading…" : "+ Add photo"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => upload(e, "image")}
            disabled={uploading !== null}
          />
        </label>
        <label className={styles.btn} style={{ cursor: "pointer" }}>
          {uploading === "video" ? "Uploading…" : "+ Add video"}
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => upload(e, "video")}
            disabled={uploading !== null}
          />
        </label>
        <button type="button" className={styles.btn} onClick={addChat}>
          + Add chat
        </button>
      </div>

      {media.length === 0 && <p className={styles.hint}>No photos, videos, or chats yet.</p>}

      {media.map((item) => (
        <div className={styles.paragraphCard} key={item.id}>
          <div className={styles.paragraphHead}>
            <span className={styles.paragraphIndex}>
              {item.type === "image" && "Photo"}
              {item.type === "video" && "Video"}
              {item.type === "chat" && "Chat"}
            </span>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </div>

          {(item.type === "image" || item.type === "video") && (
            <div className={styles.field}>
              <label>Caption (optional)</label>
              <input
                type="text"
                value={item.caption}
                onChange={(e) => updateItem(item.id, { caption: e.target.value })}
                placeholder="a little note under the photo"
              />
            </div>
          )}

          {item.type === "chat" && (
            <>
              <div className={styles.field}>
                <label>Chat title (optional)</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  placeholder="Our first text"
                />
              </div>
              {item.messages.length > 0 && (
                <div className={styles.highlightList}>
                  {item.messages.map((msg, mIdx) => (
                    <div className={styles.highlightRow} key={mIdx}>
                      <select
                        value={msg.from}
                        onChange={(e) => updateMessage(item.id, mIdx, { from: e.target.value })}
                      >
                        <option value="them">them</option>
                        <option value="me">me</option>
                      </select>
                      <input
                        type="text"
                        style={{ flex: 1, minWidth: 160 }}
                        value={msg.text}
                        onChange={(e) => updateMessage(item.id, mIdx, { text: e.target.value })}
                        placeholder="message text"
                      />
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                        onClick={() => removeMessage(item.id, mIdx)}
                      >
                        remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSmall}`}
                style={{ marginTop: 8 }}
                onClick={() => addMessage(item.id)}
              >
                + Add message
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
