import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { createProductAction } from "../../../actions";

export default async function NewProduct() {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="link-bold text-sm">
          ← Kembali ke produk
        </Link>
        <h1 className="mt-3 text-3xl">Produk baru</h1>
      </div>
      <ProductForm action={createProductAction} submitLabel="Simpan" />
    </div>
  );
}
