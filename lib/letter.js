// Turns a paragraph's plain text + a list of {phrase, song} highlights into
// an ordered list of render segments. A highlight only takes effect if its
// exact phrase is still found in the text (admin edits can drift it out of
// sync — we just skip anything that no longer matches rather than crash).
export function buildSegments(paragraph) {
  const text = paragraph?.text ?? "";
  const highlights = paragraph?.highlights ?? [];

  const found = highlights
    .filter((h) => h.phrase)
    .map((h) => ({ ...h, index: text.indexOf(h.phrase) }))
    .filter((h) => h.index !== -1)
    .sort((a, b) => a.index - b.index);

  const segments = [];
  let cursor = 0;
  for (const h of found) {
    if (h.index < cursor) continue; // overlaps an earlier highlight — skip
    if (h.index > cursor) segments.push({ text: text.slice(cursor, h.index) });
    segments.push({ text: h.phrase, song: h.song });
    cursor = h.index + h.phrase.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return segments.length ? segments : [{ text }];
}
