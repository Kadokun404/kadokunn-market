import test from "node:test";
import assert from "node:assert/strict";
import { createSession, verifySession } from "../src/lib/session.ts";

process.env.SESSION_SECRET = "x".repeat(40);

test("sesi valid diterima", async () => {
  const s = await createSession(1_000);
  assert.equal(await verifySession(s, 2_000), true);
});

test("sesi kedaluwarsa ditolak", async () => {
  const s = await createSession(1_000);
  assert.equal(await verifySession(s, 1_000 + 8 * 24 * 3600 * 1000), false);
});

test("sesi dimanipulasi ditolak", async () => {
  const s = await createSession(1_000);
  const [exp, sig] = s.split(".");
  assert.equal(await verifySession(`${Number(exp) + 999999}.${sig}`, 2_000), false);
  assert.equal(await verifySession(`${exp}.${sig.slice(0, -1)}A`, 2_000), false);
  assert.equal(await verifySession(undefined, 2_000), false);
  assert.equal(await verifySession("sampah", 2_000), false);
});
