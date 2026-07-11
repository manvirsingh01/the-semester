import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const SONGS_DIR = path.join(process.cwd(), "public", "songs");
const MEDIA_DIR = path.join(process.cwd(), "public", "media");

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

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export async function listMedia() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const files = await fs.readdir(MEDIA_DIR);
  return files
    .filter((f) => IMAGE_EXT.test(f) || VIDEO_EXT.test(f))
    .sort()
    .map((f) => ({
      name: f,
      url: `/media/${f}`,
      kind: VIDEO_EXT.test(f) ? "video" : "image",
    }));
}

export async function saveMediaFile(fileName, buffer) {
  const base = path.basename(fileName);
  const isImage = IMAGE_EXT.test(base);
  const isVideo = VIDEO_EXT.test(base);
  if (!SAFE_NAME.test(base) || (!isImage && !isVideo)) {
    throw new Error("Unsupported or unsafe file name");
  }
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const dest = path.join(MEDIA_DIR, base);
  await fs.writeFile(dest, buffer);
  return { url: `/media/${base}`, kind: isVideo ? "video" : "image" };
}
