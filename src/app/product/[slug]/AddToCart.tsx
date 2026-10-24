"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/money";
import type { Product } from "@/lib/types";

export default function AddToCart({ product }: { product: Product }) {
  const skus = product.skus ?? [];
  const [skuId, setSkuId] = useState(skus[0]?.id);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const sku = skus.find((s) => s.id === skuId);
  if (!sku) return null;
  const out = sku.stock_on_hand <= 0;
  return (
    <div className="mt-6 space-y-4">
      {skus.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {skus.map((s) => (
            <button key={s.id} onClick={() => setSkuId(s.id)} className={s.id === skuId ? "btn" : "btn-ghost"}>
              {s.variant_label}
            </button>
          ))}
        </div>
      )}
      <p className="text-2xl text-rose">{money(sku.price_cents)}</p>
      <p className="text-sm text-neutral-500">{out ? "Out of stock" : sku.stock_on_hand <= sku.reorder_point ? `Only ${sku.stock_on_hand} left` : "In stock"}</p>
      <button
        className="btn"
        disabled={out}
        onClick={() => {
          add({ skuId: sku.id, name: product.name, variant: sku.variant_label, priceCents: sku.price_cents, image: product.image_urls[0] ?? null });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
