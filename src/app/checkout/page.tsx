"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCart, useCart } from "@/lib/cart";
import { formatIdr } from "@/lib/money";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-3xl">Checkout</h1>
        <div className="card p-8 text-center">
          <p className="font-display text-xl">Keranjang kosong.</p>
          <Link href="/" className="btn mt-5">
            Lihat produk
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          address: f.get("address"),
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Checkout gagal");
      clearCart();
      router.push(`/pesanan/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout gagal");
      setBusy(false);
    }
  }

  const label = "block text-sm font-bold";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Checkout</h1>
        <p className="mt-1 font-medium text-ink/60">Isi data pengiriman, lalu bayar lewat QRIS.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-xl">Data pengiriman</h2>

          <label className={label}>
            Nama lengkap
            <input name="name" required maxLength={100} placeholder="Nama penerima" className="input mt-1.5" />
          </label>

          <label className={label}>
            No. WhatsApp
            <input
              name="phone"
              required
              maxLength={20}
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
              className="input mt-1.5"
            />
          </label>

          <label className={label}>
            Email
            <input name="email" type="email" required maxLength={120} placeholder="nama@email.com" className="input mt-1.5" />
          </label>

          <label className={label}>
            Alamat lengkap
            <textarea
              name="address"
              required
              maxLength={500}
              rows={4}
              placeholder="Jalan, nomor, RT/RW, kelurahan, kota, kode pos"
              className="input mt-1.5"
            />
          </label>

          {error && (
            <p role="alert" className="border-[3px] border-ink bg-brand-pink px-3 py-2 text-sm font-bold shadow-brutal-sm">
              {error}
            </p>
          )}

          <button className="btn w-full" disabled={busy}>
            {busy ? "Memproses…" : "Buat pesanan & bayar"}
          </button>
        </form>

        <aside className="card space-y-4 p-5 lg:sticky lg:top-6">
          <h2 className="text-xl">Ringkasan</h2>
          <ul className="space-y-2 text-sm font-medium">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span>
                  {i.name} × {i.qty}
                </span>
                <span className="shrink-0">{formatIdr(i.priceIdr * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t-[3px] border-ink pt-4 font-bold">
            <span>Subtotal</span>
            <span className="badge bg-brand-yellow text-sm">{formatIdr(subtotal)}</span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-ink/60">
            Kode unik (Rp1–999) ditambahkan ke total untuk mencocokkan pembayaran QRIS.
          </p>
        </aside>
      </div>
    </div>
  );
}
