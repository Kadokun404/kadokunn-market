"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const label = "block text-sm font-bold";

  return (
    <div className="mx-auto max-w-sm">
      <form action={action} className="card space-y-4 p-6">
        <div>
          <span className="badge bg-brand-pink">Admin</span>
          <h1 className="mt-3 text-2xl">Masuk</h1>
          <p className="mt-1 text-sm font-medium text-ink/60">Kelola produk dan pesanan toko.</p>
        </div>

        <label className={label}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="admin@example.com"
            className="input mt-1.5"
          />
        </label>

        <label className={label}>
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="input mt-1.5"
          />
        </label>

        {state?.error && (
          <p role="alert" className="border-[3px] border-ink bg-brand-pink px-3 py-2 text-sm font-bold shadow-brutal-sm">
            {state.error}
          </p>
        )}

        <button disabled={pending} className="btn w-full">
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
