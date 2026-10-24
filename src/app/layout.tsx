import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import CartLink from "./components/CartLink";

export const metadata: Metadata = {
  title: "Beauty Product Online Sales",
  description: "Skincare, makeup, hair and fragrance, delivered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="border-b border-neutral-200">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="font-serif text-xl text-rose">Beauty Product Online Sales</Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/shop">Shop</Link>
                <CartLink />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-500">
            © {new Date().getFullYear()} Beauty Product Online Sales
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
