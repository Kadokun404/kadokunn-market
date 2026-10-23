import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  let ok = false;
  try {
    ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    ok = false; // SESSION_SECRET belum diisi: tolak semua
  }
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
