import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const orderId = s.client_reference_id;
    if (orderId && s.payment_status === "paid") {
      const db = createAdminClient();
      const addr = s.collected_information?.shipping_details ?? null;
      await db
        .from("orders")
        .update({ customer_email: s.customer_details?.email, customer_name: s.customer_details?.name, shipping_address: addr })
        .eq("id", orderId);
      const { error } = await db.rpc("fulfill_order", { p_order_id: orderId });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
