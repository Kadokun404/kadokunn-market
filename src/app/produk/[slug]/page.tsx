import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductImage from "@/components/ProductImage";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/money";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Produk" };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p || !p.active) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="link-bold inline-block text-sm">
        ← Kembali ke toko
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card overflow-hidden">
          <ProductImage src={p.imageUrl} alt={p.name} className="aspect-square w-full" />
        </div>

        <div className="card flex flex-col p-6">
          <div className="flex flex-wrap items-center gap-2">
            {p.stock > 0 ? (
              <span className="badge bg-brand-green">Stok {p.stock}</span>
            ) : (
              <span className="badge bg-ink text-white">Stok habis</span>
            )}
            <span className="badge bg-white">QRIS</span>
          </div>

          <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">{p.name}</h1>

          <p className="mt-4 inline-block w-fit -rotate-1 border-[3px] border-ink bg-brand-pink px-3 py-1 font-display text-2xl shadow-brutal-sm">
            {formatIdr(p.priceIdr)}
          </p>

          {p.description && (
            <p className="mt-5 whitespace-pre-line font-medium leading-relaxed text-ink/75">
              {p.description}
            </p>
          )}

          <div className="mt-6 border-t-[3px] border-ink pt-6">
            <AddToCart
              productId={p.id}
              slug={p.slug}
              name={p.name}
              priceIdr={p.priceIdr}
              imageUrl={p.imageUrl}
              stock={p.stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
