import { NextResponse } from "next/server";
import { listMedia, saveMediaFile, MAX_MEDIA_BYTES } from "../../../lib/content";

export async function GET() {
  const media = await listMedia();
  return NextResponse.json({ media });
}

export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof file.size === "number" && file.size > MAX_MEDIA_BYTES) {
    return NextResponse.json({ error: "That file is too large — the limit is 100MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const { url, kind } = await saveMediaFile(file.name, buffer, file.type || "");
    const media = await listMedia();
    return NextResponse.json({ url, kind, media });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
