"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Seam for a real POS (Square, etc.): swap this for a webhook handler that
// inserts orders with source='pos' and calls fulfill_order the same way.
export async function recordPosSale(formData: FormData) {
  const skuId = String(formData.get("sku_id"));
  const qty = Math.floor(Number(formData.get("qty")));
  if (!skuId || !(qty > 0)) return;
  const supabase = await createClient();
  const { data: sku } = await supabase.from("skus").select("price_cents, stock_on_hand").eq("id", skuId).single();
  if (!sku || sku.stock_on_hand < qty) return;

  const { data: order } = await supabase
    .from("orders")
    .insert({ source: "pos", total_cents: sku.price_cents * qty })
    .select("id")
    .single();
  if (!order) return;
  await supabase.from("order_items").insert({ order_id: order.id, sku_id: skuId, quantity: qty, unit_price_cents: sku.price_cents });
  await supabase.from("skus").update({ stock_on_hand: sku.stock_on_hand - qty }).eq("id", skuId);
  await supabase.from("inventory_movements").insert({ sku_id: skuId, delta: -qty, reason: "sale", ref: order.id });
  await supabase.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id);
  revalidatePath("/admin", "layout");
}
