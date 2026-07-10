import { NextResponse } from "next/server";
import { listSongs, saveSongFile } from "../../../lib/content";

export async function GET() {
  const songs = await listSongs();
  return NextResponse.json({ songs });
}

export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const url = await saveSongFile(file.name, buffer);
    const songs = await listSongs();
    return NextResponse.json({ url, songs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
