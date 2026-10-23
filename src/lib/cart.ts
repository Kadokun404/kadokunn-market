"use client";

import { useMemo, useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceIdr: number;
  imageUrl: string | null;
  qty: number;
};

const KEY = "toko:cart";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function parse(raw: string): CartItem[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // penyimpanan tidak tersedia; keranjang tidak tersimpan
  }
  listeners.forEach((l) => l());
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const items = parse(getSnapshot());
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) existing.qty += qty;
  else items.push({ ...item, qty });
  write(items);
}

export function setQty(productId: string, qty: number) {
  const items = parse(getSnapshot());
  write(
    qty <= 0
      ? items.filter((i) => i.productId !== productId)
      : items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
  );
}

export function removeFromCart(productId: string) {
  write(parse(getSnapshot()).filter((i) => i.productId !== productId));
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parse(raw), [raw]);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.priceIdr, 0);
  return { items, count, subtotal };
}
