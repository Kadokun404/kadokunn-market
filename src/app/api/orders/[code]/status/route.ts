import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { syncOrder } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  // satu klien polling tiap ~4 dtk; batasi agar gateway GoBiz tidak kebanjiran
  if (!rateLimit(`status:${clientIp(req)}`, 40, 60_000)) {
    return NextResponse.json({ error: "Terlalu sering" }, { status: 429 });
  }
  const { code } = await params;
  const order = await syncOrder(code);
  if (!order) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ status: order.status });
}
