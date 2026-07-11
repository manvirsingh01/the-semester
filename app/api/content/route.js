import { NextResponse } from "next/server";
import { readContent, writeContent } from "../../../lib/content";

export async function GET() {
  const content = await readContent();
  return NextResponse.json(content);
}

function validate(content) {
  if (!content || typeof content !== "object") return "Content must be an object";
  if (!content.site || typeof content.site.title !== "string") {
    return "site.title is required";
  }
  if (!Array.isArray(content.envelopes)) return "envelopes must be an array";
  for (const env of content.envelopes) {
    if (typeof env.id !== "number") return "Every envelope needs a numeric id";
    if (typeof env.title !== "string") return `Envelope ${env.id} needs a title`;
    if (!Array.isArray(env.paragraphs)) return `Envelope ${env.id} paragraphs must be an array`;
    for (const p of env.paragraphs) {
      if (typeof p.text !== "string") return `Envelope ${env.id} has a paragraph without text`;
      if (!Array.isArray(p.highlights)) return `Envelope ${env.id} has a paragraph with invalid highlights`;
    }
    if (env.media !== undefined) {
      if (!Array.isArray(env.media)) return `Envelope ${env.id} media must be an array`;
      for (const m of env.media) {
        if (!["image", "video", "chat"].includes(m.type)) {
          return `Envelope ${env.id} has a media item with an invalid type`;
        }
        if (typeof m.x !== "number" || typeof m.y !== "number" || typeof m.width !== "number") {
          return `Envelope ${env.id} has a media item with invalid position/size`;
        }
      }
    }
  }
  return null;
}

export async function PUT(request) {
  const body = await request.json();
  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  await writeContent(body);
  return NextResponse.json({ ok: true });
}
