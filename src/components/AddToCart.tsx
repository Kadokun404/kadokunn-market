"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
  productId: string;
  slug: string;
  name: string;
  priceIdr: number;
  imageUrl: string | null;
  stock: number;
};

export default function AddToCart({ stock, ...item }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);

  if (stock <= 0) {
    return (
      <button className="btn w-full" disabled>
        Stok habis
      </button>
    );
  }

  const clamp = (n: number) => Math.min(stock, Math.max(1, n));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-stretch border-[3px] border-ink bg-white shadow-brutal-sm">
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q - 1))}
            disabled={qty <= 1}
            aria-label="Kurangi jumlah"
            className="px-3 font-display text-lg disabled:opacity-40"
          >
            -
          </button>
          <span
            aria-live="polite"
            className="grid min-w-12 place-items-center border-x-[3px] border-ink px-2 font-bold"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q + 1))}
            disabled={qty >= stock}
            aria-label="Tambah jumlah"
            className="px-3 font-display text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
        <span className="text-sm font-medium text-ink/60">Stok tersedia {stock}</span>
      </div>

      <button
        className="btn w-full"
        onClick={() => {
          addToCart(item, qty);
          router.push("/keranjang");
        }}
      >
        Tambah ke keranjang
      </button>
    </div>
  );
}
