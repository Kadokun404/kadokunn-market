// Sesi admin: cookie "<expiry>.<hmac>" memakai Web Crypto, jadi bisa dipakai di middleware (edge) maupun server.

const enc = new TextEncoder();
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_S = TTL_MS / 1000;

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET harus diisi, minimal 32 karakter");
  }
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toB64Url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(value: string): Promise<string> {
  return toB64Url(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(value)));
}

export async function createSession(now = Date.now()): Promise<string> {
  const exp = String(now + TTL_MS);
  return `${exp}.${await sign(exp)}`;
}

export async function verifySession(
  value: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || !(Number(exp) > now)) return false;
  return safeEqual(sig, await sign(exp));
}
