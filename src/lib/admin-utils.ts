import { supabase } from "@/integrations/supabase/client";

/** Trigger a browser download from a string blob. */
export function downloadBlob(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + content], { type: mime }); // BOM for Excel Arabic
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/** Convert array of objects to CSV. */
export function toCSV(rows: Record<string, any>[], columns?: string[]): string {
  if (!rows.length) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function exportCSV(filename: string, rows: Record<string, any>[], columns?: string[]) {
  downloadBlob(filename, toCSV(rows, columns), "text/csv;charset=utf-8");
}

/** Record an admin action to audit_log. Best-effort; ignored on error. */
export async function logAudit(action: string, entity_type: string, entity_id?: string | null, meta?: any) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("audit_log").insert({
      actor_id: data.user.id, action, entity_type, entity_id: entity_id ?? null, meta: meta ?? null,
    });
  } catch { /* ignore */ }
}

/** Record admin/staff login event. */
export async function logAdminLogin(event: "login" | "logout") {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("admin_login_log").insert({
      user_id: data.user.id, event, user_agent: navigator.userAgent, ip: null,
    });
  } catch { /* ignore */ }
}
