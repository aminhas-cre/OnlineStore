"use server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { buildBackorderEmail, type POItem } from "@/lib/reorders";
import type { Vendor } from "@/lib/types";

// Group every SKU at/below its reorder point by vendor into draft POs.
export async function generateDrafts() {
  const supabase = await createClient();
  const { data: skus } = await supabase
    .from("skus")
    .select("id, sku_code, variant_label, cost_cents, stock_on_hand, reorder_point, reorder_qty, vendor_id, products(name)")
    .not("vendor_id", "is", null);
  const { data: open } = await supabase.from("purchase_orders").select("vendor_id, items").in("status", ["draft", "sent"]);
  const covered = new Set((open ?? []).flatMap((po) => (po.items as POItem[]).map((i) => i.sku_id)));

  const byVendor = new Map<string, POItem[]>();
  for (const s of skus ?? []) {
    if (s.stock_on_hand > s.reorder_point || covered.has(s.id)) continue;
    const p = s.products as unknown as { name: string } | null;
    const list = byVendor.get(s.vendor_id!) ?? [];
    list.push({ sku_id: s.id, sku_code: s.sku_code, name: `${p?.name}${s.variant_label ? ` (${s.variant_label})` : ""}`, qty: s.reorder_qty, cost_cents: s.cost_cents });
    byVendor.set(s.vendor_id!, list);
  }
  for (const [vendorId, items] of byVendor) {
    const { data: vendor } = await supabase.from("vendors").select("*").eq("id", vendorId).single();
    if (!vendor) continue;
    const email = buildBackorderEmail(vendor as Vendor, items);
    await supabase.from("purchase_orders").insert({ vendor_id: vendorId, items, email_subject: email.subject, email_body: email.body });
  }
  revalidatePath("/admin/reorders");
}

export async function saveDraft(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("purchase_orders")
    .update({ email_subject: String(formData.get("subject")), email_body: String(formData.get("body")) })
    .eq("id", String(formData.get("po_id")))
    .eq("status", "draft");
  revalidatePath("/admin/reorders");
}

export async function sendPO(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("po_id"));
  const { data: po } = await supabase.from("purchase_orders").select("*, vendors(contact_email)").eq("id", id).eq("status", "draft").single();
  if (!po) return;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.VENDOR_EMAIL_FROM;
  if (!key || !from) throw new Error("Email isn't configured: set RESEND_API_KEY and VENDOR_EMAIL_FROM.");
  const to = (po.vendors as unknown as { contact_email: string }).contact_email;
  const { error } = await new Resend(key).emails.send({ from, to, subject: po.email_subject, text: po.email_body });
  if (error) throw new Error(error.message);
  await supabase.from("purchase_orders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/reorders");
}

export async function receivePO(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("po_id"));
  const { data: po } = await supabase.from("purchase_orders").select("items").eq("id", id).eq("status", "sent").single();
  if (!po) return;
  for (const i of po.items as POItem[]) {
    const { data: sku } = await supabase.from("skus").select("stock_on_hand").eq("id", i.sku_id).single();
    if (!sku) continue;
    await supabase.from("skus").update({ stock_on_hand: sku.stock_on_hand + i.qty }).eq("id", i.sku_id);
    await supabase.from("inventory_movements").insert({ sku_id: i.sku_id, delta: i.qty, reason: "restock", ref: id });
  }
  await supabase.from("purchase_orders").update({ status: "received" }).eq("id", id);
  revalidatePath("/admin", "layout");
}
