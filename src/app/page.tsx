import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <section className="card grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
        <div>
          <span className="badge bg-brand-pink">Toko lokal · Bayar QRIS</span>
          <h1 className="mt-4 text-4xl leading-[0.95] sm:text-5xl">
            Barang pilihan,
            <br />
            harga jujur.
          </h1>
          <p className="mt-4 max-w-xl font-medium text-ink/70">
            Pilih produk, checkout, lalu scan QRIS. Pesanan diproses otomatis setelah pembayaran
            terverifikasi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="#produk" className="btn">
              Lihat produk
            </Link>
            <Link href="/keranjang" className="btn-ghost">
              Buka keranjang
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-48 md:block">
          <div className="absolute inset-x-2 top-0 rotate-3 border-[3px] border-ink bg-brand-blue p-5 text-center text-white shadow-brutal">
            <p className="font-display text-2xl leading-none">BAYAR</p>
            <p className="font-display text-4xl leading-none">QRIS</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest">Scan · Bayar · Selesai</p>
          </div>
          <div className="absolute inset-x-8 bottom-0 -rotate-2 border-[3px] border-ink bg-brand-green p-3 text-center shadow-brutal">
            <p className="text-xs font-bold uppercase tracking-wide">Konfirmasi otomatis</p>
          </div>
        </div>
      </section>

      <section id="produk" className="scroll-mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl">Produk</h2>
          <span className="badge bg-brand-yellow">{products.length} item</span>
        </div>

        {products.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-display text-xl">Belum ada produk.</p>
            <p className="mt-2 font-medium text-ink/60">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/produk/${p.slug}`}
                className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-brutal-lg"
              >
                <ProductImage
                  src={p.imageUrl}
                  alt={p.name}
                  className="aspect-square w-full border-b-[3px] border-ink"
                />
                <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
                  <h2 className="line-clamp-2 font-display text-sm leading-tight sm:text-base">
                    {p.name}
                  </h2>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <span className="badge bg-brand-yellow">{formatIdr(p.priceIdr)}</span>
                    {p.stock <= 0 ? (
                      <span className="badge bg-ink text-white">Habis</span>
                    ) : (
                      <span className="text-xs font-medium text-ink/60">Stok {p.stock}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
