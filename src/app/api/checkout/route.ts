import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }
  const { items } = (await req.json()) as { items: { skuId: string; qty: number }[] };
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

  // Prices come from the DB, never from the client.
  const db = createAdminClient();
  const { data: skus } = await db
    .from("skus")
    .select("id, price_cents, variant_label, stock_on_hand, products(name, image_urls)")
    .in("id", items.map((i) => i.skuId));

  const lines: { sku: NonNullable<typeof skus>[number]; qty: number }[] = [];
  for (const i of items) {
    const sku = skus?.find((s) => s.id === i.skuId);
    const qty = Math.floor(Number(i.qty));
    if (!sku || qty < 1) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    if (sku.stock_on_hand < qty) return NextResponse.json({ error: "Not enough stock for an item in your cart." }, { status: 409 });
    lines.push({ sku, qty });
  }

  const total = lines.reduce((n, l) => n + l.sku.price_cents * l.qty, 0);
  const { data: order, error } = await db.from("orders").insert({ source: "online", total_cents: total }).select("id").single();
  if (error || !order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  await db.from("order_items").insert(
    lines.map((l) => ({ order_id: order.id, sku_id: l.sku.id, quantity: l.qty, unit_price_cents: l.sku.price_cents }))
  );

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    shipping_address_collection: { allowed_countries: ["US"] },
    line_items: lines.map((l) => {
      const prod = l.sku.products as unknown as { name: string; image_urls: string[] };
      return {
        quantity: l.qty,
        price_data: {
          currency: "usd",
          unit_amount: l.sku.price_cents,
          product_data: {
            name: `${prod.name}${l.sku.variant_label ? ` (${l.sku.variant_label})` : ""}`,
            images: prod.image_urls.slice(0, 1),
          },
        },
      };
    }),
    success_url: `${site}/checkout/success`,
    cancel_url: `${site}/cart`,
  });
  await db.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
  return NextResponse.json({ url: session.url });
}
