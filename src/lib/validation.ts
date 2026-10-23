import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[0-9]{7,12}$/, "Nomor WhatsApp tidak valid"),
  email: z.string().trim().email().max(120),
  address: z.string().trim().min(10, "Alamat terlalu pendek").max(500),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung")
    .max(120),
  description: z.string().trim().max(5000),
  priceIdr: z.coerce.number().int().min(1000).max(1_000_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "URL gambar harus diawali http(s)://")
    .transform((v) => (v === "" ? null : v)),
  active: z.boolean(),
});
