"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adjustStock(formData: FormData) {
  const skuId = String(formData.get("sku_id"));
  const delta = Number(formData.get("delta"));
  if (!Number.isFinite(delta) || delta === 0) return;
  const supabase = await createClient();
  const { data: sku } = await supabase.from("skus").select("stock_on_hand").eq("id", skuId).single();
  if (!sku) return;
  await supabase.from("skus").update({ stock_on_hand: sku.stock_on_hand + delta }).eq("id", skuId);
  await supabase.from("inventory_movements").insert({ sku_id: skuId, delta, reason: "adjust" });
  revalidatePath("/admin/inventory");
}
