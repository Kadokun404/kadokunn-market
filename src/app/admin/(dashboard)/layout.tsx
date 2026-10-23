import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-b-[3px] border-ink pb-4">
        <span className="badge bg-brand-pink">Admin</span>
        <Link href="/admin" className="link-bold text-sm">
          Produk
        </Link>
        <Link href="/admin/pesanan" className="link-bold text-sm">
          Pesanan
        </Link>
        <form action={logoutAction} className="ml-auto">
          <button type="submit" className="btn-ghost text-sm">
            Keluar
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
