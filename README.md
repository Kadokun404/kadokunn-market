# Toko (Next.js + Postgres + GoPay QRIS)

Pembayaran lewat gateway GoPay/GoBiz terpisah (dari zip `gobiz-in-vercel`): toko membuat QRIS dinamis
dan mengecek pembayaran lewat riwayat transaksi GoBiz. Pembayaran dicocokkan dengan **nominal + waktu**,
jadi tiap pesanan diberi kode unik 1–999 rupiah yang tidak bentrok dengan pesanan PENDING lain.

## Menjalankan
1. Deploy gateway, isi `INTERNAL_TOKEN`, `GOPAY_*` di sana (lihat README gateway).
2. `cp .env.example .env` lalu isi `GOPAY_GATEWAY_URL`, `GOPAY_INTERNAL_TOKEN` (sama dengan `INTERNAL_TOKEN`), `SESSION_SECRET`, `ADMIN_*`, `CRON_SECRET`.
3. `docker compose up -d && npm install && npx prisma migrate dev && npm run db:seed && npm run dev`
4. Admin: `/admin`. Jadwalkan `GET /api/cron/sync` tiap menit dengan `Authorization: Bearer $CRON_SECRET`.

## Catatan
- Login GoBiz lewat password bisa diblokir (403); gunakan `scripts/login-otp.mjs` di gateway.
- Ini memakai API internal GoBiz yang tidak terdokumentasi dan bisa berubah/ditolak sewaktu-waktu.
- Rate limit ada di memori per instance; untuk serverless multi-instance pindahkan ke Redis.
- `npm test` (sesi admin), `npm run lint`, dan `npm run build` sudah lulus. Alur database belum diuji
  lokal di Termux/Android karena Prisma engine tidak kompatibel dengan platform ini; uji migrasi dan
  checkout di Neon/Vercel.
- Tema antarmuka: neobrutalism (kuning/pink, border tebal, hard shadow) dengan font Archivo Black +
  Space Grotesk.
