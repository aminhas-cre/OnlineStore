"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function Success() {
  const { clear } = useCart();
  useEffect(() => { clear(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="py-16 text-center">
      <h1 className="font-serif text-3xl text-rose">Thank you!</h1>
      <p className="mt-3">Your order is confirmed. A receipt is on its way to your email.</p>
      <Link href="/shop" className="btn mt-6">Keep shopping</Link>
    </div>
  );
}
