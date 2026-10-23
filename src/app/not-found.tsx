import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-8 text-center">
        <span className="sticker mx-auto text-lg">404</span>
        <h1 className="mt-5 text-3xl">Halaman tidak ditemukan</h1>
        <p className="mt-2 font-medium text-ink/60">
          Alamat yang kamu buka mungkin salah atau produk sudah tidak tersedia.
        </p>
        <Link href="/" className="btn mt-6">
          Kembali ke toko
        </Link>
      </div>
    </div>
  );
}
