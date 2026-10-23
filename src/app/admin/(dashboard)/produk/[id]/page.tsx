import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProductAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="link-bold text-sm">
          ← Kembali ke produk
        </Link>
        <h1 className="mt-3 text-3xl">Ubah produk</h1>
      </div>
      <ProductForm
        action={updateProductAction.bind(null, p.id)}
        submitLabel="Simpan perubahan"
        initial={{
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceIdr: p.priceIdr,
          stock: p.stock,
          imageUrl: p.imageUrl ?? "",
          active: p.active,
        }}
      />
    </div>
  );
}
