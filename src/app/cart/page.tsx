"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/money";

export default function CartPage() {
  const { lines, setQty, totalCents } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function checkout() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: lines.map((l) => ({ skuId: l.skuId, qty: l.qty })) }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else { setErr(json.error ?? "Checkout failed"); setBusy(false); }
  }

  if (!lines.length)
    return <p>Your cart is empty. <Link href="/shop" className="text-rose underline">Keep shopping</Link></p>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-serif text-3xl">Your cart</h1>
      {lines.map((l) => (
        <div key={l.skuId} className="flex items-center gap-4 border-b border-neutral-200 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {l.image && <img src={l.image} alt="" className="h-16 w-16 rounded-lg object-cover" />}
          <div className="flex-1">
            <p className="font-medium">{l.name}</p>
            <p className="text-sm text-neutral-500">{l.variant}</p>
          </div>
          <input type="number" min={0} value={l.qty} onChange={(e) => setQty(l.skuId, Number(e.target.value))} className="input w-20" />
          <p className="w-20 text-right">{money(l.priceCents * l.qty)}</p>
        </div>
      ))}
      <p className="text-right text-xl">Total: {money(totalCents)}</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="text-right"><button className="btn" onClick={checkout} disabled={busy}>{busy ? "Redirecting…" : "Checkout"}</button></div>
      <p className="text-right text-xs text-neutral-500">Test mode: use card 4242 4242 4242 4242.</p>
    </div>
  );
}
