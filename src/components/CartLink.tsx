"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/keranjang" className="btn-ghost shrink-0 bg-white">
      Keranjang
      <span className="grid h-6 min-w-6 place-items-center border-2 border-ink bg-brand-pink px-1 text-xs font-bold">
        {count}
      </span>
    </Link>
  );
}
