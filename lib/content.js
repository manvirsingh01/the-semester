import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const SONGS_DIR = path.join(process.cwd(), "public", "songs");

export async function readContent() {
  const raw = await fs.readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function writeContent(content) {
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n", "utf-8");
}

export async function listSongs() {
  const files = await fs.readdir(SONGS_DIR);
  return files
    .filter((f) => /\.(mp3|wav|ogg|m4a)$/i.test(f))
    .sort()
    .map((f) => ({ name: f, url: `/songs/${f}` }));
}

const SAFE_NAME = /^[a-zA-Z0-9 _.\-]+$/;

export async function saveSongFile(fileName, buffer) {
  const base = path.basename(fileName);
  if (!SAFE_NAME.test(base) || !/\.(mp3|wav|ogg|m4a)$/i.test(base)) {
    throw new Error("Unsupported or unsafe file name");
  }
  const dest = path.join(SONGS_DIR, base);
  await fs.writeFile(dest, buffer);
  return `/songs/${base}`;
}
