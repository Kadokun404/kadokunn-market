import type { Metadata } from "next";
import Link from "next/link";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import CartLink from "@/components/CartLink";
import "./globals.css";

const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Toko Saya";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://market.kadokunn.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: shopName, template: `%s | ${shopName}` },
  description: `Belanja online di ${shopName}`,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: shopName,
    title: shopName,
    description: `Belanja online di ${shopName}`,
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${grotesk.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <header className="border-b-4 border-ink bg-brand-yellow">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 -rotate-6 place-items-center border-[3px] border-ink bg-brand-pink font-display text-xl shadow-brutal-sm">
                {shopName.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-display text-lg sm:text-xl">{shopName}</span>
            </Link>
            <CartLink />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t-4 border-ink bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm font-medium sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} <span className="font-bold">{shopName}</span>
            </p>
            <p className="text-ink/60">Pembayaran QRIS · Diproses otomatis</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
