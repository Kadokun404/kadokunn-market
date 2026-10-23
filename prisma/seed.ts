import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { slug: "kaos-polos-hitam", name: "Kaos Polos Hitam", description: "Katun combed 30s, nyaman dipakai sehari-hari.", priceIdr: 85000, stock: 25 },
  { slug: "tote-bag-kanvas", name: "Tote Bag Kanvas", description: "Kanvas tebal dengan resleting dan saku dalam.", priceIdr: 65000, stock: 40 },
  { slug: "mug-keramik-putih", name: "Mug Keramik Putih", description: "Kapasitas 350 ml, aman untuk microwave.", priceIdr: 35000, stock: 60 },
  { slug: "notebook-a5", name: "Notebook A5", description: "100 lembar, kertas 80 gsm, sampul keras.", priceIdr: 45000, stock: 50 },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log(`Seed selesai: ${products.length} produk.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
