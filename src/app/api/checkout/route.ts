import { NextResponse } from "next/server";
import { OrderError, placeOrder } from "@/lib/order";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan, tunggu sebentar." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 },
    );
  }

  try {
    const code = await placeOrder(parsed.data);
    return NextResponse.json({ code });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("[checkout]", e);
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi." }, { status: 500 });
  }
}
