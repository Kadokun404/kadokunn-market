import { randomBytes, randomInt } from "node:crypto";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./db";
import { checkQris, createQris } from "./payment";

export const ORDER_TTL_MS = 15 * 60 * 1000;

export class OrderError extends Error {}

export type CheckoutInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  items: { productId: string; qty: number }[];
};

function makeCode(): string {
  return "TK-" + randomBytes(8).toString("hex").toUpperCase();
}

// Kode unik 1..999 rupiah, unik di antara pesanan PENDING yang belum kedaluwarsa,
// karena gateway mencocokkan pembayaran lewat nominal + waktu.
async function pickUniqueCode(
  tx: Prisma.TransactionClient,
  subtotal: number,
): Promise<number> {
  const pending = await tx.order.findMany({
    where: { status: "PENDING", expiresAt: { gt: new Date() } },
    select: { totalIdr: true },
  });
  const used = new Set(pending.map((o) => o.totalIdr));
  for (let i = 0; i < 50; i++) {
    const code = randomInt(1, 1000);
    if (!used.has(subtotal + code)) return code;
  }
  throw new OrderError("Sedang ramai, coba lagi sebentar lagi.");
}

export async function placeOrder(input: CheckoutInput): Promise<string> {
  // gabungkan baris dengan produk yang sama
  const qtyById = new Map<string, number>();
  for (const i of input.items) {
    qtyById.set(i.productId, (qtyById.get(i.productId) ?? 0) + i.qty);
  }

  const order = await prisma.$transaction(
    async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...qtyById.keys()] }, active: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const lines: { id: string; name: string; price: number; qty: number }[] = [];
      for (const [id, qty] of qtyById) {
        const p = byId.get(id);
        if (!p) throw new OrderError("Ada produk yang sudah tidak tersedia.");
        if (p.stock < qty) throw new OrderError(`Stok "${p.name}" tidak cukup.`);
        subtotal += p.priceIdr * qty; // harga selalu dari database
        lines.push({ id: p.id, name: p.name, price: p.priceIdr, qty });
      }

      for (const l of lines) {
        const r = await tx.product.updateMany({
          where: { id: l.id, stock: { gte: l.qty } },
          data: { stock: { decrement: l.qty } },
        });
        if (r.count !== 1) throw new OrderError(`Stok "${l.name}" tidak cukup.`);
      }

      const uniqueCode = await pickUniqueCode(tx, subtotal);
      return tx.order.create({
        data: {
          code: makeCode(),
          customerName: input.name,
          customerPhone: input.phone,
          customerEmail: input.email,
          address: input.address,
          subtotalIdr: subtotal,
          uniqueCode,
          totalIdr: subtotal + uniqueCode,
          expiresAt: new Date(Date.now() + ORDER_TTL_MS),
          items: {
            create: lines.map((l) => ({
              productId: l.id,
              nameSnapshot: l.name,
              priceSnapshot: l.price,
              qty: l.qty,
            })),
          },
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  try {
    const q = await createQris(order.totalIdr);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: q.refNo,
        qrContent: q.qrContent,
        qrCreatedAt: new Date(q.createdAt),
      },
    });
  } catch (e) {
    console.error("[order] gagal membuat QRIS:", e);
    await releaseOrder(order.id, "CANCELLED");
    throw new OrderError("Pembayaran sedang tidak tersedia, coba lagi nanti.");
  }

  return order.code;
}

// Ubah pesanan PENDING menjadi EXPIRED/CANCELLED dan kembalikan stok (sekali saja).
export async function releaseOrder(
  orderId: string,
  to: "EXPIRED" | "CANCELLED",
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const r = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: to },
    });
    if (r.count !== 1) return false;
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const i of items) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stock: { increment: i.qty } },
      });
    }
    return true;
  });
}

// Dipanggil saat halaman pesanan dibuka dan oleh polling klien.
export async function syncOrder(code: string) {
  const include = { items: true } as const;
  const order = await prisma.order.findUnique({ where: { code }, include });
  if (!order || order.status !== OrderStatus.PENDING) return order;

  // Cek pembayaran dulu supaya pembayaran tepat sebelum kedaluwarsa tetap diakui.
  if (order.paymentRef && order.qrCreatedAt) {
    const s = await checkQris({
      refNo: order.paymentRef,
      amount: order.totalIdr,
      createdAt: order.qrCreatedAt.toISOString(),
    });
    if (s === "PAID") {
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date() },
      });
      return prisma.order.findUnique({ where: { code }, include });
    }
  }

  if (order.expiresAt.getTime() < Date.now()) {
    await releaseOrder(order.id, "EXPIRED");
    return prisma.order.findUnique({ where: { code }, include });
  }
  return order;
}
