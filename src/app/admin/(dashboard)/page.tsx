import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/money";
import { deactivateProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Produk</h1>
          <p className="mt-1 text-sm font-medium text-ink/60">{products.length} produk terdaftar.</p>
        </div>
        <Link href="/admin/produk/baru" className="btn">
          Tambah produk
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b-[3px] border-ink bg-brand-yellow">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-ink">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-bold">{p.name}</td>
                <td className="whitespace-nowrap p-3 font-medium">{formatIdr(p.priceIdr)}</td>
                <td className="p-3 font-medium">{p.stock}</td>
                <td className="p-3">
                  <span className={`badge ${p.active ? "bg-brand-green" : "bg-ink text-white"}`}>
                    {p.active ? "Tampil" : "Nonaktif"}
                  </span>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <Link href={`/admin/produk/${p.id}`} className="link-bold text-xs">
                    Ubah
                  </Link>
                  {p.active && (
                    <form action={deactivateProductAction.bind(null, p.id)} className="ml-3 inline">
                      <button className="text-xs font-bold text-red-700 underline decoration-2 underline-offset-2">
                        Nonaktifkan
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-center font-medium text-ink/60">Belum ada produk.</p>
        )}
      </div>
    </div>
  );
}
