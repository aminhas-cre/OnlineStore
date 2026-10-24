import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { recordPosSale } from "./actions";

export default async function Pos() {
  const supabase = await createClient();
  const { data: skus } = await supabase.from("skus").select("id, sku_code, variant_label, price_cents, stock_on_hand, products(name)").order("sku_code");
  const { data: recent } = await supabase.from("orders").select("id, total_cents, created_at").eq("source", "pos").order("created_at", { ascending: false }).limit(5);
  return (
    <div className="max-w-xl space-y-8">
      <form action={recordPosSale} className="space-y-3">
        <h1 className="font-serif text-2xl">Record in-store sale</h1>
        <select name="sku_id" className="input" required>
          {(skus ?? []).map((s) => {
            const p = s.products as unknown as { name: string } | null;
            return <option key={s.id} value={s.id}>{s.sku_code} · {p?.name}{s.variant_label ? ` (${s.variant_label})` : ""} · {money(s.price_cents)} · {s.stock_on_hand} in stock</option>;
          })}
        </select>
        <input name="qty" type="number" min={1} defaultValue={1} className="input w-28" />
        <button className="btn">Ring up</button>
      </form>
      <section>
        <h2 className="mb-2 font-medium">Recent POS sales</h2>
        <ul className="text-sm">{(recent ?? []).map((o) => <li key={o.id} className="flex justify-between border-b border-neutral-100 py-1"><span>{new Date(o.created_at).toLocaleString()}</span><span>{money(o.total_cents)}</span></li>)}</ul>
      </section>
    </div>
  );
}
