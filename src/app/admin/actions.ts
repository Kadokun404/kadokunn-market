"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { checkAdminCredentials, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { releaseOrder } from "@/lib/order";
import { rateLimit } from "@/lib/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE_S, createSession } from "@/lib/session";
import { productSchema } from "@/lib/validation";

export type FormState = { error?: string } | undefined;

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 5, 15 * 60_000)) {
    return { error: "Terlalu banyak percobaan, coba lagi nanti." };
  }
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!checkAdminCredentials(email, password)) {
    return { error: "Email atau password salah." };
  }
  let token: string;
  try {
    token = await createSession();
  } catch {
    return { error: "SESSION_SECRET belum diisi di server." };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function parseProduct(form: FormData) {
  return productSchema.safeParse({
    name: form.get("name") ?? "",
    slug: form.get("slug") ?? "",
    description: form.get("description") ?? "",
    priceIdr: form.get("priceIdr") ?? "",
    stock: form.get("stock") ?? "",
    imageUrl: form.get("imageUrl") ?? "",
    active: form.get("active") === "on",
  });
}

export async function createProductAction(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProduct(form);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  try {
    await prisma.product.create({ data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Slug sudah dipakai produk lain." };
    }
    throw e;
  }
  revalidatePath("/");
  redirect("/admin");
}

export async function updateProductAction(
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProduct(form);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return { error: "Slug sudah dipakai produk lain." };
      if (e.code === "P2025") return { error: "Produk tidak ditemukan." };
    }
    throw e;
  }
  revalidatePath("/");
  revalidatePath(`/produk/${parsed.data.slug}`);
  redirect("/admin");
}

// Produk yang sudah pernah dipesan tidak dihapus (menjaga riwayat), cukup dinonaktifkan.
export async function deactivateProductAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active: false } });
  revalidatePath("/");
  revalidatePath("/admin");
}

const NEXT_STATUS = {
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
} as const;

export async function advanceOrderAction(orderId: string, to: "PROCESSING" | "SHIPPED") {
  await requireAdmin();
  const from = to === "PROCESSING" ? "PAID" : "PROCESSING";
  if (!(NEXT_STATUS[from] as readonly string[]).includes(to)) return;
  // updateMany dengan syarat status asal mencegah loncat status / balapan klik ganda
  await prisma.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } });
  revalidatePath("/admin/pesanan");
}

export async function cancelOrderAction(orderId: string) {
  await requireAdmin();
  // hanya pesanan yang belum dibayar; stok dikembalikan oleh releaseOrder
  await releaseOrder(orderId, "CANCELLED");
  revalidatePath("/admin/pesanan");
}
