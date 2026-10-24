"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartLine = {
  skuId: string;
  name: string;
  variant: string | null;
  priceCents: number;
  image: string | null;
  qty: number;
};

type CartCtx = {
  lines: CartLine[];
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (skuId: string, qty: number) => void;
  clear: () => void;
  count: number;
  totalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const value: CartCtx = {
    lines,
    add: (l, qty = 1) =>
      setLines((cur) => {
        const hit = cur.find((x) => x.skuId === l.skuId);
        return hit
          ? cur.map((x) => (x.skuId === l.skuId ? { ...x, qty: x.qty + qty } : x))
          : [...cur, { ...l, qty }];
      }),
    setQty: (skuId, qty) =>
      setLines((cur) =>
        qty <= 0 ? cur.filter((x) => x.skuId !== skuId) : cur.map((x) => (x.skuId === skuId ? { ...x, qty } : x))
      ),
    clear: () => setLines([]),
    count: lines.reduce((n, l) => n + l.qty, 0),
    totalCents: lines.reduce((n, l) => n + l.qty * l.priceCents, 0),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
