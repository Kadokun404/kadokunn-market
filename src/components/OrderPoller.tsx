"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderPoller({ code, expiresAt }: { code: string; expiresAt: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/${code}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const { status } = await res.json();
        if (!stopped && status !== "PENDING") router.refresh();
      } catch {
        // abaikan, coba lagi di putaran berikutnya
      }
    };
    const id = setInterval(tick, 4000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [code, router]);

  return <Countdown expiresAt={expiresAt} />;
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const end = new Date(expiresAt).getTime();
  const [left, setLeft] = useState(() => Math.max(0, end - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);

  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <span className="inline-flex items-center gap-2 border-[3px] border-ink bg-brand-yellow px-3 py-1.5 text-sm font-bold shadow-brutal-sm">
      <span className="h-2.5 w-2.5 border-2 border-ink bg-brand-pink" aria-hidden />
      {left > 0 ? (
        <span className="tabular-nums">
          Bayar dalam {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </span>
      ) : (
        "Waktu habis"
      )}
    </span>
  );
}
