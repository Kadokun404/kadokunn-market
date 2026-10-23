import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/money";
import { advanceOrderAction, cancelOrderAction } from "../../actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  PENDING: "Menunggu bayar",
  PAID: "Sudah dibayar",
  PROCESSING: "Diproses",
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

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-3xl">Pesanan</h1>
      <p className="mt-1 max-w-3xl text-sm font-medium text-ink/60">
        Pembayaran dicek otomatis saat pembeli membuka halaman pesanannya. Pesanan yang pembelinya
        sudah menutup halaman bisa tetap berstatus “Menunggu bayar” walau sudah dibayar; cek mutasi
        GoBiz bila perlu.
      </p>

      <ul className="mt-5 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="card p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="font-display text-lg">{o.code}</strong>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${STYLE[o.status] ?? "bg-white"}`}>
                  {LABEL[o.status] ?? o.status}
                </span>
                <span className="font-bold">{formatIdr(o.totalIdr)}</span>
              </div>
            </div>

            <div className="mt-3 space-y-0.5 font-medium text-ink/75">
              <p>
                {o.customerName} · {o.customerPhone} · {o.customerEmail}
              </p>
              <p>{o.address}</p>
            </div>

            <ul className="mt-3 list-disc space-y-0.5 border-t-[3px] border-ink pl-5 pt-3 font-medium">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.nameSnapshot} × {i.qty}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              {o.status === "PAID" && (
                <form action={advanceOrderAction.bind(null, o.id, "PROCESSING")}>
                  <button className="btn text-xs">Proses</button>
                </form>
              )}
              {o.status === "PROCESSING" && (
                <form action={advanceOrderAction.bind(null, o.id, "SHIPPED")}>
                  <button className="btn text-xs">Tandai dikirim</button>
                </form>
              )}
              {o.status === "PENDING" && (
                <form action={cancelOrderAction.bind(null, o.id)}>
                  <button className="btn-ghost text-xs text-red-700">Batalkan</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>

      {orders.length === 0 && (
        <div className="card mt-5 p-8 text-center">
          <p className="font-display text-xl">Belum ada pesanan.</p>
        </div>
      )}
    </div>
  );
}
