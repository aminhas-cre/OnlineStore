# Beauty Product Online Sales

Next.js 15 storefront + admin dashboard on Vercel, with Supabase for SKUs/inventory, Stripe (test mode) checkout, and Resend vendor backorder emails.

## Features
- Storefront: `/`, `/shop`, `/product/[slug]`, `/cart`, Stripe Checkout, `/checkout/success`
- Admin (`/admin`, Supabase Auth + `admins` table): overview dashboard, inventory, in-store POS entry, vendor reorders (editable email templates, one-click send)
- Inventory is decremented by the `fulfill_order` DB function (online) or the POS action, with an `inventory_movements` audit trail.

## Setup
1. `cp .env.example .env.local` and fill in the keys (Supabase anon + service role, Stripe test keys, Resend key + verified sender).
2. Create an admin: sign up a user in Supabase Auth, then `insert into public.admins (user_id) values ('<auth user id>');`
3. Stripe webhook: point `checkout.session.completed` at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
4. `npm run dev`

## POS integration
`src/app/admin/(panel)/pos/actions.ts` is the seam. A real POS (e.g. Square) would insert `orders` with `source='pos'` from a webhook and decrement stock the same way.
