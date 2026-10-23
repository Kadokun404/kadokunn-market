"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { removeFromCart, setQty, useCart } from "@/lib/cart";
import { formatIdr } from "@/lib/money";

export default function CartPage() {
  const { items, count, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-3xl">Keranjang</h1>
        <div className="card p-8 text-center">
          <p className="font-display text-xl">Keranjang masih kosong.</p>
          <p className="mt-2 font-medium text-ink/60">Yuk pilih produk dulu.</p>
          <Link href="/" className="btn mt-5">
            Lihat produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl">Keranjang</h1>
        <span className="badge bg-brand-yellow">{count} item</span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="card divide-y-[3px] divide-ink overflow-hidden">
          {items.map((i) => (
            <li key={i.productId} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <ProductImage
                src={i.imageUrl}
                alt={i.name}
                className="h-16 w-16 shrink-0 border-[3px] border-ink"
              />
              <div className="min-w-0 flex-1">
                <Link href={`/produk/${i.slug}`} className="font-bold hover:underline">
                  {i.name}
                </Link>
                <p className="mt-0.5 text-sm font-medium text-ink/60">{formatIdr(i.priceIdr)}</p>
              </div>
              <input
                type="number"
                min={1}
                value={i.qty}
                onChange={(e) =>
                  setQty(i.productId, Math.max(0, Math.trunc(Number(e.target.value) || 0)))
                }
                className="input w-20"
                aria-label={`Jumlah ${i.name}`}
              />
              <button className="btn-ghost" onClick={() => removeFromCart(i.productId)}>
                Hapus
              </button>
            </li>
          ))}
        </ul>

        <aside className="card space-y-4 p-5 lg:sticky lg:top-6">
          <h2 className="text-xl">Ringkasan</h2>
          <div className="flex items-center justify-between border-t-[3px] border-ink pt-4 text-lg font-bold">
            <span>Subtotal</span>
            <span className="badge bg-brand-yellow text-sm">{formatIdr(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn w-full">
            Checkout
          </Link>
          <p className="text-xs font-medium leading-relaxed text-ink/60">
            Total akhir ditentukan server saat checkout, ditambah kode unik pembayaran.
          </p>
        </aside>
      </div>
    </div>
  );
}
