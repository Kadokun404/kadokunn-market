import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncOrder } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cek pembayaran semua pesanan PENDING walau pembeli sudah menutup halaman.
// Jadwalkan tiap menit (mis. Vercel Cron / cron server) dengan header
// "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret ?? "");
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.order.findMany({
    where: { status: "PENDING" },
    select: { code: true },
    take: 50,
    orderBy: { createdAt: "asc" },
  });
  let paid = 0;
  for (const { code } of pending) {
    const o = await syncOrder(code);
    if (o?.status === "PAID") paid++;
  }
  return NextResponse.json({ checked: pending.length, paid });
}
