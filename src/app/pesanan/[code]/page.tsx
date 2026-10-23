import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import OrderPoller from "@/components/OrderPoller";
import { formatIdr } from "@/lib/money";
import { syncOrder } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const metadata: Metadata = { title: "Status pesanan", robots: { index: false } };

const LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Pembayaran diterima",
  PROCESSING: "Sedang diproses",
  SHIPPED: "Dikirim",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
};

const STYLE: Record<string, string> = {
  PENDING: "bg-brand-yellow",
  PAID: "bg-brand-green",
  PROCESSING: "bg-brand-blue text-white",
  SHIPPED: "bg-brand-green",
  EXPIRED: "bg-brand-pink",
  CANCELLED: "bg-ink text-white",
};

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await syncOrder(code);
  if (!order) notFound();

  const qr =
    order.status === "PENDING" && order.qrContent
      ? await QRCode.toDataURL(order.qrContent, { margin: 1, width: 320 })
      : null;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <Link href="/" className="link-bold text-sm">
          ← Kembali ke toko
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl">Pesanan</h1>
          <span className="badge bg-white">{order.code}</span>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`badge ${STYLE[order.status] ?? "bg-white"}`}>
            {LABEL[order.status] ?? order.status}
          </span>
          <span className="font-display text-xl">{formatIdr(order.totalIdr)}</span>
        </div>
        {order.status === "PENDING" && (
          <p className="mt-2 text-sm font-medium text-ink/60">
            Selesaikan pembayaran sebelum waktu habis agar pesanan tidak dibatalkan.
          </p>
        )}
      </div>

      {qr && (
        <section className="card p-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QRIS pembayaran"
            width={320}
            height={320}
            className="mx-auto w-full max-w-[320px] border-[3px] border-ink bg-white"
          />
          <p className="mt-4 font-display text-xl">Bayar tepat {formatIdr(order.totalIdr)}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink/60">
            Scan dengan GoPay, OVO, DANA, m-banking, atau aplikasi QRIS lain. Nominal harus sama
            persis (termasuk kode unik {order.uniqueCode}).
          </p>
          <div className="mt-3 flex justify-center">
            <OrderPoller code={order.code} expiresAt={order.expiresAt.toISOString()} />
          </div>
        </section>
      )}

      {order.status === "EXPIRED" && (
        <p className="border-[3px] border-ink bg-brand-yellow p-4 text-sm font-medium shadow-brutal-sm">
          Waktu pembayaran habis. Jika kamu sudah terlanjur membayar, hubungi toko dengan
          menyertakan kode pesanan.
        </p>
      )}

      <section className="card p-5 text-sm">
        <h2 className="text-lg">Rincian</h2>
        <ul className="mt-3 space-y-1 font-medium">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.nameSnapshot} × {i.qty}
              </span>
              <span className="shrink-0">{formatIdr(i.priceSnapshot * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t-[3px] border-ink pt-3 font-medium">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatIdr(order.subtotalIdr)}</span>
          </p>
          <p className="flex justify-between">
            <span>Kode unik</span>
            <span>{formatIdr(order.uniqueCode)}</span>
          </p>
          <p className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatIdr(order.totalIdr)}</span>
          </p>
        </div>
      </section>

      <p className="text-xs font-medium text-ink/50">
        Simpan kode pesanan ini untuk menanyakan status ke toko.
      </p>
    </div>
  );
}
