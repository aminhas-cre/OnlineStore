import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "../components/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATS = ["skincare", "makeup", "hair", "fragrance"];

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("products").select("*, skus(*)").eq("active", true).order("name");
  if (category) q = q.eq("category", category);
  const { data } = await q;
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/shop" className={category ? "btn-ghost" : "btn"}>All</Link>
        {CATS.map((c) => (
          <Link key={c} href={`/shop?category=${c}`} className={`capitalize ${category === c ? "btn" : "btn-ghost"}`}>{c}</Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {((data ?? []) as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
