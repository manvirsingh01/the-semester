"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Admin.module.css";
import EnvelopeEditor from "./EnvelopeEditor";
import LivePreview from "./LivePreview";

export default function AdminPage() {
  const [content, setContent] = useState(null);
  const [songs, setSongs] = useState([]);
  const [activeId, setActiveId] = useState(1);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadAll = useCallback(async () => {
    const [contentData, songsData] = await Promise.all([
      fetch("/api/content").then((r) => r.json()),
      fetch("/api/songs").then((r) => r.json()),
    ]);
    setContent(contentData);
    setSongs(songsData.songs);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!content) {
    return <div className={styles.loading}>Loading the archive…</div>;
  }

  const activeEnvelope = content.envelopes.find((e) => e.id === activeId);

  const updateSite = (field, value) =>
    setContent({ ...content, site: { ...content.site, [field]: value } });

  const updateEnvelope = (patch) =>
    setContent({
      ...content,
      envelopes: content.envelopes.map((e) => (e.id === activeId ? patch : e)),
    });

  const updateMedia = (id, patch) => {
    const media = activeEnvelope.media || [];
    const nextMedia =
      patch === null ? media.filter((m) => m.id !== id) : media.map((m) => (m.id === id ? { ...m, ...patch } : m));
    updateEnvelope({ ...activeEnvelope, media: nextMedia });
  };

  const addEnvelope = () => {
    const nextId = Math.max(0, ...content.envelopes.map((e) => e.id)) + 1;
    const newEnvelope = {
      id: nextId,
      title: `Envelope ${nextId}`,
      dateline: "",
      locked: true,
      signOff: "",
      paragraphs: [],
      backgroundSong: "",
    };
    setContent({ ...content, envelopes: [...content.envelopes, newEnvelope] });
    setActiveId(nextId);
  };

  const handleSave = async () => {
    setStatus({ type: "saving", message: "Saving…" });
    // Only the envelope you're actively editing unlocks itself on save, and only
    // once it has content. Other envelopes may be deliberately pre-written but
    // kept hidden (e.g. "Episode 2 is coming"), so saving never unlocks those.
    const payload = {
      ...content,
      envelopes: content.envelopes.map((env) => {
        if (env.id !== activeId) return env;
        const hasContent = env.paragraphs.some((p) => p.text.trim().length > 0);
        return hasContent && env.locked ? { ...env, locked: false } : env;
      }),
    };
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setContent(payload);
      setStatus({ type: "saved", message: "Saved ✓ — the site now shows this." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/songs", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSongs(data.songs);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Admin — edit The Semester</h1>
        <Link href="/" className={styles.viewLink}>
          view site →
        </Link>
      </div>

      <div className={styles.pageBody}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Site settings</div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Site title</label>
                <input
                  type="text"
                  value={content.site.title}
                  onChange={(e) => updateSite("title", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Subtitle</label>
                <input
                  type="text"
                  value={content.site.subtitle}
                  onChange={(e) => updateSite("subtitle", e.target.value)}
                />
              </div>
            </div>
            <div className={styles.songManager}>
              <label className={styles.btn} style={{ cursor: "pointer" }}>
                {uploading ? "Uploading…" : "+ Upload a song"}
                <input
                  type="file"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
              <span className={styles.hint} style={{ margin: 0 }}>
                {songs.length} song(s) available — pick a background song per envelope below
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Envelopes</div>
            <p className={styles.hint}>
              Tabs with a checkmark already have paragraphs written. An envelope only appears
              openable on the site once it&apos;s unlocked <em>and</em> has at least one paragraph.
            </p>
            <div className={styles.tabs}>
              {content.envelopes.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  className={`${styles.tab} ${env.id === activeId ? styles.active : ""} ${
                    env.paragraphs.length ? styles.hasContent : ""
                  }`}
                  onClick={() => setActiveId(env.id)}
                >
                  {env.id}
                </button>
              ))}
              <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={addEnvelope}>
                + Add envelope
              </button>
            </div>

            {activeEnvelope && (
              <EnvelopeEditor envelope={activeEnvelope} songs={songs} onChange={updateEnvelope} />
            )}
          </div>
        </div>

        <LivePreview envelope={activeEnvelope} onMediaChange={updateMedia} />
      </div>

      <div className={styles.saveBar}>
        {status && (
          <span className={`${styles.status} ${status.type === "error" ? styles.error : ""}`}>
            {status.message}
          </span>
        )}
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
          Save changes
        </button>
      </div>
    </div>
  );
}
