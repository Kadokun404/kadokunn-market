"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";

type Values = {
  name: string;
  slug: string;
  description: string;
  priceIdr: number | "";
  stock: number | "";
  imageUrl: string;
  active: boolean;
};

const EMPTY: Values = { name: "", slug: "", description: "", priceIdr: "", stock: 0, imageUrl: "", active: true };

const input = "input mt-1.5";
const label = "block text-sm font-bold";

export default function ProductForm({
  action,
  initial = EMPTY,
  submitLabel,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  initial?: Values;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="card max-w-xl space-y-4 p-5 sm:p-6">
      <label className={label}>
        Nama
        <input name="name" required defaultValue={initial.name} className={input} />
      </label>

      <label className={label}>
        Slug (untuk URL)
        <input
          name="slug"
          required
          defaultValue={initial.slug}
          placeholder="contoh: kaos-polos-hitam"
          className={input}
        />
      </label>

      <label className={label}>
        Deskripsi
        <textarea name="description" rows={4} defaultValue={initial.description} className={input} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Harga (Rp)
          <input
            name="priceIdr"
            type="number"
            min={1000}
            step={1}
            required
            defaultValue={initial.priceIdr}
            className={input}
          />
        </label>
        <label className={label}>
          Stok
          <input
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={initial.stock}
            className={input}
          />
        </label>
      </div>

      <label className={label}>
        URL gambar (opsional)
        <input name="imageUrl" defaultValue={initial.imageUrl} placeholder="https://…" className={input} />
      </label>

      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial.active}
          className="h-5 w-5 border-[3px] border-ink accent-brand-pink"
        />
        Tampilkan di toko
      </label>

      {state?.error && (
        <p role="alert" className="border-[3px] border-ink bg-brand-pink px-3 py-2 text-sm font-bold shadow-brutal-sm">
          {state.error}
        </p>
      )}

      <button disabled={pending} className="btn">
        {pending ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}
