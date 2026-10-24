import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCart from "./AddToCart";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, skus(*)").eq("slug", slug).eq("active", true).maybeSingle();
  if (!data) notFound();
  const p = data as Product;
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-3">
        {p.image_urls.map((u) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={u} src={u} alt={p.name} className="w-full rounded-xl bg-blush object-cover" />
        ))}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{p.brand} · {p.category}</p>
        <h1 className="mt-1 font-serif text-3xl">{p.name}</h1>
        <p className="mt-4 text-neutral-700">{p.description}</p>
        <AddToCart product={p} />
      </div>
    </div>
  );
}
