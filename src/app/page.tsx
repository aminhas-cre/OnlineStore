import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "./components/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATS = ["skincare", "makeup", "hair", "fragrance"];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, skus(*)").eq("active", true).limit(4);
  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-blush px-8 py-16 text-center">
        <h1 className="font-serif text-4xl text-rose md:text-5xl">Beauty that works as hard as you do</h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-700">Skincare, makeup, hair and fragrance, picked with care and shipped fast.</p>
        <Link href="/shop" className="btn mt-8">Shop all</Link>
      </section>
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATS.map((c) => (
          <Link key={c} href={`/shop?category=${c}`} className="rounded-xl border border-neutral-200 p-6 text-center capitalize hover:bg-blush">{c}</Link>
        ))}
      </section>
      <section>
        <h2 className="mb-4 font-serif text-2xl">Featured</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {((data ?? []) as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
