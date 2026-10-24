import { createClient } from "@/lib/supabase/server";
import { generateDrafts, receivePO, saveDraft, sendPO } from "./actions";

export default async function Reorders() {
  const supabase = await createClient();
  const { data: pos } = await supabase
    .from("purchase_orders")
    .select("*, vendors(name, contact_email)")
    .neq("status", "received")
    .order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Vendor reorders</h1>
        <form action={generateDrafts}><button className="btn">Draft backorders for low stock</button></form>
      </div>
      {!pos?.length && <p className="text-sm text-neutral-500">Nothing pending. Hit the button to scan for SKUs at or below their reorder point.</p>}
      {(pos ?? []).map((po) => {
        const v = po.vendors as unknown as { name: string; contact_email: string };
        return (
          <div key={po.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex justify-between text-sm">
              <p className="font-medium">{v.name} <span className="font-normal text-neutral-500">· {v.contact_email}</span></p>
              <span className="rounded-full bg-blush px-3 py-0.5 text-xs capitalize">{po.status}</span>
            </div>
            {po.status === "draft" ? (
              <form className="space-y-2">
                <input type="hidden" name="po_id" value={po.id} />
                <input name="subject" defaultValue={po.email_subject} className="input" />
                <textarea name="body" defaultValue={po.email_body} rows={10} className="input font-mono" />
                <div className="flex gap-2">
                  <button formAction={saveDraft} className="btn-ghost">Save edits</button>
                  <button formAction={sendPO} className="btn">Send to vendor</button>
                </div>
              </form>
            ) : (
              <>
                <pre className="whitespace-pre-wrap text-sm text-neutral-600">{po.email_body}</pre>
                <form action={receivePO}><input type="hidden" name="po_id" value={po.id} /><button className="btn-ghost">Mark received (restock)</button></form>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
