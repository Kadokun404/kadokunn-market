"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-8 text-center">
        <span className="sticker mx-auto text-lg">Error</span>
        <h1 className="mt-5 text-3xl">Terjadi kesalahan</h1>
        <p className="mt-2 font-medium text-ink/60">
          Permintaan gagal diproses. Coba lagi beberapa saat lagi.
        </p>
        {error.digest && <p className="mt-2 text-xs font-medium text-ink/50">Kode: {error.digest}</p>}
        <button type="button" onClick={reset} className="btn mt-6">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
