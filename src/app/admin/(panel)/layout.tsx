import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?denied=1");
  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-5 border-b border-neutral-200 pb-3 text-sm">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/inventory">Inventory</Link>
        <Link href="/admin/pos">POS</Link>
        <Link href="/admin/reorders">Reorders</Link>
        <Link href="/" className="ml-auto text-neutral-500">View store</Link>
      </nav>
      {children}
    </div>
  );
}
