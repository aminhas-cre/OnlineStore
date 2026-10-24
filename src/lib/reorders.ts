import type { Vendor } from "./types";

export type POItem = { sku_id: string; sku_code: string; name: string; qty: number; cost_cents: number };

const storeName = () => process.env.STORE_NAME ?? "Beauty Product Online Sales";

export function buildBackorderEmail(vendor: Vendor, items: POItem[]) {
  const table = items
    .map((i) => `  • ${i.sku_code}  ${i.name}  x ${i.qty}`)
    .join("\n");
  const body = vendor.email_template
    .replaceAll("{{vendor_name}}", vendor.name)
    .replaceAll("{{items_table}}", table)
    .replaceAll("{{store_name}}", storeName());
  return { subject: `Backorder request from ${storeName()} (${items.length} item${items.length === 1 ? "" : "s"})`, body };
}
