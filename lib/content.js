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

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|3gp|3gpp|mpe?g|ogv|wmv)$/i;
export const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
  "video/3gpp": "3gp",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
};

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

// Photos/videos get their own generated file name rather than trusting the
// uploaded one, so real-world file names (parentheses, apostrophes, non-ASCII
// characters from phones) never get rejected or collide with each other.
export async function saveMediaFile(fileName, buffer, mimeType = "") {
  if (buffer.length > MAX_MEDIA_BYTES) {
    throw new Error("That file is too large — the limit is 100MB");
  }

  const isImage = IMAGE_EXT.test(fileName) || mimeType.startsWith("image/");
  const isVideo = VIDEO_EXT.test(fileName) || mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    throw new Error("Unsupported file type — please upload an image or video");
  }

  const originalExt = path.extname(fileName).replace(".", "").toLowerCase();
  const ext = originalExt || MIME_EXT[mimeType] || (isVideo ? "mp4" : "jpg");
  const base = `${isVideo ? "video" : "image"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const dest = path.join(MEDIA_DIR, base);
  await fs.writeFile(dest, buffer);
  return { url: `/media/${base}`, kind: isVideo ? "video" : "image" };
}
