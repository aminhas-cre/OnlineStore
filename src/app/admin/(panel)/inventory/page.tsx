import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { adjustStock } from "./actions";

export default async function Inventory() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skus")
    .select("id, sku_code, variant_label, price_cents, cost_cents, stock_on_hand, reorder_point, products(name), vendors(name)")
    .order("sku_code");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-neutral-500">
          <tr><th className="py-2">SKU</th><th>Product</th><th>Vendor</th><th>Price</th><th>Cost</th><th>Stock</th><th>Adjust (+/-)</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((s) => {
            const p = s.products as unknown as { name: string } | null;
            const v = s.vendors as unknown as { name: string } | null;
            const low = s.stock_on_hand <= s.reorder_point;
            return (
              <tr key={s.id} className="border-t border-neutral-100">
                <td className="py-2 font-mono">{s.sku_code}</td>
                <td>{p?.name}{s.variant_label ? ` — ${s.variant_label}` : ""}</td>
                <td>{v?.name}</td>
                <td>{money(s.price_cents)}</td>
                <td>{money(s.cost_cents)}</td>
                <td className={low ? "font-medium text-red-600" : ""}>{s.stock_on_hand}</td>
                <td>
                  <form action={adjustStock} className="flex gap-2">
                    <input type="hidden" name="sku_id" value={s.id} />
                    <input name="delta" type="number" className="input w-20" placeholder="+10" />
                    <button className="btn-ghost !py-1">Save</button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
