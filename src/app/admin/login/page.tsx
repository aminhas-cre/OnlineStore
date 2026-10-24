"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function Form() {
  const router = useRouter();
  const denied = useSearchParams().get("denied");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(denied ? "That account isn't an admin." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    else router.push("/admin");
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
      <h1 className="font-serif text-2xl">Admin sign in</h1>
      <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn w-full">Sign in</button>
    </form>
  );
}

export default function Login() {
  return <Suspense><Form /></Suspense>;
}
