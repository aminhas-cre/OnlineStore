import Link from "next/link";
import { money } from "@/lib/money";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const prices = (p.skus ?? []).map((s) => s.price_cents);
  const from = prices.length ? Math.min(...prices) : 0;
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl bg-blush">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-neutral-500">{p.brand}</p>
      <h3 className="font-medium">{p.name}</h3>
      <p className="text-sm text-rose">{prices.length > 1 ? "From " : ""}{money(from)}</p>
    </Link>
  );
}
