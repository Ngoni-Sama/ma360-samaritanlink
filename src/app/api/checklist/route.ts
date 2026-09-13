import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CHECKLIST_SEED } from "@/lib/data/checklist-seed";

export const dynamic = "force-dynamic";

async function ensureSeeded() {
  const count = await db.checklistItem.count();
  if (count === 0) {
    await db.checklistItem.createMany({
      data: CHECKLIST_SEED.map((it, i) => ({
        category: it.category, label: it.label, detail: it.detail ?? null,
        link: it.link ?? null, status: it.status, source: it.source, order: i,
      })),
    });
  }
}

export async function GET() {
  await ensureSeeded();
  const items = await db.checklistItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { op } = body;

  if (op === "toggle") {
    const it = await db.checklistItem.update({ where: { id: body.id }, data: { checked: Boolean(body.checked) } });
    return NextResponse.json(it);
  }
  if (op === "notes") {
    const it = await db.checklistItem.update({ where: { id: body.id }, data: { notes: String(body.notes ?? "") } });
    return NextResponse.json(it);
  }
  if (op === "status") {
    const it = await db.checklistItem.update({ where: { id: body.id }, data: { status: String(body.status) } });
    return NextResponse.json(it);
  }
  if (op === "add") {
    const max = await db.checklistItem.aggregate({ _max: { order: true } });
    const it = await db.checklistItem.create({
      data: {
        category: String(body.category || "Z. Custom"),
        label: String(body.label || "New item"),
        detail: body.detail ?? null, link: body.link ?? null,
        status: "todo", source: "Manual", order: (max._max.order ?? 0) + 1,
      },
    });
    return NextResponse.json(it);
  }
  if (op === "delete") {
    await db.checklistItem.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  }
  if (op === "reset") {
    await db.checklistItem.deleteMany();
    await ensureSeeded();
    const items = await db.checklistItem.findMany({ orderBy: [{ order: "asc" }] });
    return NextResponse.json(items);
  }
  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
