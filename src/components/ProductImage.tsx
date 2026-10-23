// Memakai <img> biasa agar URL gambar eksternal tidak perlu didaftarkan di next.config.
/* eslint-disable @next/next/no-img-element */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`grid place-items-center bg-brand-yellow/40 text-xs font-bold uppercase tracking-wide text-ink/50 ${className}`}
      >
        Tanpa gambar
      </div>
    );
  }
  return <img src={src} alt={alt} className={`object-cover ${className}`} loading="lazy" />;
}
