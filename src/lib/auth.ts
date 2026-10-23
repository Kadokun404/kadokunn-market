import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "./session";

function digest(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

export function checkAdminCredentials(email: string, password: string): boolean {
  const e = process.env.ADMIN_EMAIL;
  const p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return false;
  // bandingkan digest supaya waktu eksekusi tidak membocorkan panjang/isi
  const okEmail = timingSafeEqual(digest(email.trim().toLowerCase()), digest(e.trim().toLowerCase()));
  const okPass = timingSafeEqual(digest(password), digest(p));
  return okEmail && okPass;
}

export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!(await verifySession(jar.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}
