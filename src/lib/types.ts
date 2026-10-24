export type Sku = {
  id: string;
  product_id: string;
  sku_code: string;
  variant_label: string | null;
  price_cents: number;
  cost_cents: number;
  vendor_id: string | null;
  stock_on_hand: number;
  reorder_point: number;
  reorder_qty: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  category: string;
  image_urls: string[];
  active: boolean;
  skus?: Sku[];
};

export type Vendor = {
  id: string;
  name: string;
  contact_email: string;
  lead_time_days: number;
  email_template: string;
};
