// Klien untuk gateway QRIS GoPay/GoBiz (deploy terpisah). Lihat README gateway.

export type Qris = {
  refNo: string;
  amount: number;
  qrContent: string;
  createdAt: string;
};

export type PayStatus = "PAID" | "PENDING" | "ERROR";

function config() {
  const base = process.env.GOPAY_GATEWAY_URL?.replace(/\/+$/, "");
  const token = process.env.GOPAY_INTERNAL_TOKEN;
  if (!base || !token) {
    throw new Error("GOPAY_GATEWAY_URL dan GOPAY_INTERNAL_TOKEN belum diisi");
  }
  return { base, token };
}

export async function createQris(amount: number): Promise<Qris> {
  const { base, token } = config();
  const res = await fetch(`${base}/api/gopay/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-token": token },
    body: JSON.stringify({ amount }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gateway create gagal (${res.status})`);
  const data = await res.json();
  if (!data?.qr_content || !data?.ref_no || !data?.created_at) {
    throw new Error("Respons gateway create tidak lengkap");
  }
  return {
    refNo: String(data.ref_no),
    amount: Number(data.amount),
    qrContent: String(data.qr_content),
    createdAt: String(data.created_at),
  };
}

export async function checkQris(q: {
  refNo: string;
  amount: number;
  createdAt: string;
}): Promise<PayStatus> {
  const { base, token } = config();
  const params = new URLSearchParams({
    ref: q.refNo,
    amount: String(q.amount),
    created_at: q.createdAt,
  });
  try {
    // Token hanya lewat header, bukan query string, supaya tidak masuk log URL.
    const res = await fetch(`${base}/api/gopay/status?${params}`, {
      headers: { "x-internal-token": token },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) return "ERROR";
    const data = await res.json();
    return data?.paid === true ? "PAID" : "PENDING";
  } catch {
    return "ERROR";
  }
}
