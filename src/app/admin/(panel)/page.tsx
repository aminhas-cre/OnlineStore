import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import RevenueChart from "./Charts";

type OrderRow = { total_cents: number; source: string; created_at: string; order_items: { quantity: number; unit_price_cents: number; sku: { sku_code: string; cost_cents: number } | null }[] };

export default async function Overview() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: orders }, { data: skus }] = await Promise.all([
    supabase.from("orders").select("total_cents, source, created_at, order_items(quantity, unit_price_cents, sku:skus(sku_code, cost_cents))").eq("status", "paid").gte("created_at", since),
    supabase.from("skus").select("id, sku_code, variant_label, stock_on_hand, reorder_point, products(name)"),
  ]);
  const rows = (orders ?? []) as unknown as OrderRow[];
  const revenue = rows.reduce((n, o) => n + o.total_cents, 0);
  const cogs = rows.reduce((n, o) => n + o.order_items.reduce((m, i) => m + i.quantity * (i.sku?.cost_cents ?? 0), 0), 0);
  const bySource = (s: string) => rows.filter((o) => o.source === s).reduce((n, o) => n + o.total_cents, 0);

  const days: Record<string, { day: string; online: number; pos: number }> = {};
  for (let d = 29; d >= 0; d--) {
    const key = new Date(Date.now() - d * 864e5).toISOString().slice(5, 10);
    days[key] = { day: key, online: 0, pos: 0 };
  }
  rows.forEach((o) => {
    const k = o.created_at.slice(5, 10);
    if (days[k]) days[k][o.source as "online" | "pos"] += o.total_cents / 100;
  });

  const tally: Record<string, number> = {};
  rows.forEach((o) => o.order_items.forEach((i) => { const c = i.sku?.sku_code ?? "?"; tally[c] = (tally[c] ?? 0) + i.quantity; }));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const low = (skus ?? []).filter((s) => s.stock_on_hand <= s.reorder_point);
  const kpis = [
    ["Revenue (30d)", money(revenue)],
    ["Gross profit", money(revenue - cogs)],
    ["Orders", String(rows.length)],
    ["Online / POS", `${money(bySource("online"))} / ${money(bySource("pos"))}`],
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500">{k}</p>
            <p className="mt-1 text-xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-2 font-medium">Daily revenue</h2>
        <RevenueChart data={Object.values(days)} />
      </section>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-2 font-medium">Top SKUs (units, 30d)</h2>
          {top.length ? <ul className="text-sm">{top.map(([c, n]) => <li key={c} className="flex justify-between border-b border-neutral-100 py-1"><span>{c}</span><span>{n}</span></li>)}</ul> : <p className="text-sm text-neutral-500">No sales yet. Try the POS tab.</p>}
        </section>
        <section>
          <h2 className="mb-2 font-medium">Low stock ({low.length}) <Link href="/admin/reorders" className="ml-2 text-sm text-rose underline">Reorder</Link></h2>
          <ul className="text-sm">
            {low.map((s) => <li key={s.id} className="flex justify-between border-b border-neutral-100 py-1"><span>{s.sku_code}</span><span className="text-red-600">{s.stock_on_hand} / {s.reorder_point}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
