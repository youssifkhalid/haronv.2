import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Tag, Wallet, CreditCard, CalendarX, Clock3, MessageSquare, FileText, Megaphone,
  Bell, ShieldCheck, ClipboardList, BarChart3, Download, Search, Trash2, Pencil, Check, X, Eye, EyeOff, Send, Ban, Star, ExternalLink, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EntityDialog, ConfirmButton, AddButton, IconEdit, IconDelete, type Field } from "@/components/admin/EntityDialog";
import { exportCSV, logAudit } from "@/lib/admin-utils";
import {
  promotionsQuery, expensesQuery, subscriptionPlansQuery, customerSubsQuery,
  auditLogQuery, blackoutDatesQuery, waitlistQuery, paymentMethodsQuery, paymentProofsQuery,
  notificationTemplatesQuery, notificationsLogQuery, contentPagesQuery, bannersQuery,
  contactMessagesQuery, adminLoginLogQuery, adminPermissionsQuery, posTransactionsQuery,
  customerProfilesExtQuery, allBookingsQuery, usersAdminQuery,
} from "@/lib/queries";

/* ============ Shared CRUD panel ============ */
function useCrud(table: string, invalidateKey: string) {
  const qc = useQueryClient();
  return {
    async save(payload: any, editingId?: string) {
      const { error } = editingId
        ? await (supabase.from as any)(table).update(payload).eq("id", editingId)
        : await (supabase.from as any)(table).insert(payload);
      if (error) { toast.error(error.message); return false; }
      toast.success("تم الحفظ");
      await logAudit(editingId ? "update" : "create", table, editingId);
      qc.invalidateQueries({ queryKey: [invalidateKey] });
      return true;
    },
    async del(id: string) {
      const { error } = await (supabase.from as any)(table).delete().eq("id", id);
      if (error) { toast.error(error.message); return; }
      toast.success("تم الحذف");
      await logAudit("delete", table, id);
      qc.invalidateQueries({ queryKey: [invalidateKey] });
    },
    async toggle(row: any, field: string) {
      const { error } = await (supabase.from as any)(table).update({ [field]: !row[field] }).eq("id", row.id);
      if (error) { toast.error(error.message); return; }
      qc.invalidateQueries({ queryKey: [invalidateKey] });
    },
  };
}

/* ============ PROMOTIONS ============ */
const promoFields: Field[] = [
  { name: "name", label: "اسم العرض", required: true },
  { name: "code", label: "الكود (اختياري)", placeholder: "GOLD10" },
  { name: "description", label: "الوصف", type: "textarea" },
  { name: "discount_type", label: "نوع الخصم (percent أو fixed)", required: true, placeholder: "percent" },
  { name: "discount_value", label: "قيمة الخصم", type: "number", required: true },
  { name: "starts_at", label: "يبدأ في (YYYY-MM-DDTHH:mm)", placeholder: "2026-01-01T00:00" },
  { name: "ends_at", label: "ينتهي في (YYYY-MM-DDTHH:mm)" },
  { name: "max_uses", label: "الحد الأقصى للاستخدام", type: "number" },
  { name: "is_active", label: "مفعّل", type: "boolean" },
];
export function PromotionsPanel() {
  const { data: rows = [] } = useQuery(promotionsQuery());
  const crud = useCrud("promotions", "promotions");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{rows.length} عرض</Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV("promotions.csv", rows)}><Download className="h-3 w-3 ml-1" /> تصدير</Button>
          <AddButton onClick={() => setDialog({ open: true })} label="إضافة عرض" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((p: any) => (
          <div key={p.id} className={`rounded-2xl border p-4 ${p.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold">{p.name}</div>
                {p.code && <div className="mt-1 inline-block rounded-lg bg-gold/10 px-2 py-0.5 font-mono text-xs text-gold">{p.code}</div>}
              </div>
              <span className="font-black text-gold">
                {p.discount_type === "percent" ? `${p.discount_value}%` : `${p.discount_value} ج.م`}
              </span>
            </div>
            {p.description && <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {p.starts_at && <span>من {new Date(p.starts_at).toLocaleDateString("ar-EG")}</span>}
              {p.ends_at && <span>حتى {new Date(p.ends_at).toLocaleDateString("ar-EG")}</span>}
              {p.max_uses && <span>الحد: {p.uses_count}/{p.max_uses}</span>}
            </div>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => setDialog({ open: true, editing: p })} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent"><IconEdit /> تعديل</button>
              <button onClick={() => crud.toggle(p, "is_active")} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent">
                {p.is_active ? <><EyeOff className="h-3 w-3" /> تعطيل</> : <><Eye className="h-3 w-3" /> تفعيل</>}
              </button>
              <ConfirmButton onConfirm={() => crud.del(p.id)}><IconDelete /></ConfirmButton>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="col-span-full p-10 text-center text-muted-foreground">لا توجد عروض.</div>}
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل عرض" : "إضافة عرض"} fields={promoFields}
          initial={dialog.editing ?? { is_active: true, discount_type: "percent", discount_value: 10 }}
          onSubmit={async (v: any) => {
            const payload: any = { ...v };
            payload.discount_value = Number(v.discount_value);
            payload.max_uses = v.max_uses ? Number(v.max_uses) : null;
            payload.starts_at = v.starts_at || null;
            payload.ends_at = v.ends_at || null;
            payload.code = v.code || null;
            await crud.save(payload, dialog.editing?.id);
          }} />
      )}
    </div>
  );
}

/* ============ EXPENSES ============ */
const expenseFields: Field[] = [
  { name: "title", label: "البند", required: true },
  { name: "category", label: "الفئة", placeholder: "إيجار / أدوات / رواتب" },
  { name: "amount_egp", label: "المبلغ (ج.م)", type: "number", required: true },
  { name: "expense_date", label: "التاريخ (YYYY-MM-DD)", required: true },
  { name: "notes", label: "ملاحظات", type: "textarea" },
  { name: "is_debt", label: "دين", type: "boolean" },
  { name: "paid", label: "مدفوع", type: "boolean" },
];
export function ExpensesPanel() {
  const { data: rows = [] } = useQuery(expensesQuery());
  const crud = useCrud("expenses", "expenses");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const total = rows.reduce((s: number, r: any) => s + Number(r.amount_egp), 0);
  const unpaid = rows.filter((r: any) => !r.paid).reduce((s: number, r: any) => s + Number(r.amount_egp), 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">إجمالي المصاريف</div><div className="mt-1 text-xl font-black text-destructive">{total.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">ديون غير مسددة</div><div className="mt-1 text-xl font-black text-amber-400">{unpaid.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">عدد البنود</div><div className="mt-1 text-xl font-black">{rows.length}</div></div>
      </div>
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV("expenses.csv", rows)}><Download className="h-3 w-3 ml-1" /> تصدير</Button>
          <AddButton onClick={() => setDialog({ open: true })} label="إضافة مصروف" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
            <th className="p-3 text-right">البند</th><th className="p-3 text-right">الفئة</th><th className="p-3 text-right">التاريخ</th>
            <th className="p-3 text-right">المبلغ</th><th className="p-3 text-right">النوع</th><th className="p-3 text-right">إجراء</th>
          </tr></thead>
          <tbody>
            {rows.map((e: any) => (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3 font-bold">{e.title}{e.notes && <div className="text-xs text-muted-foreground">{e.notes}</div>}</td>
                <td className="p-3 text-xs">{e.category ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{e.expense_date}</td>
                <td className="p-3 font-bold text-destructive">{Number(e.amount_egp).toFixed(0)}</td>
                <td className="p-3">
                  {e.is_debt ? <Badge className="bg-amber-500/10 text-amber-400">دين {e.paid ? "مسدد" : "غير مسدد"}</Badge> : <Badge variant="outline">مصروف</Badge>}
                </td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => setDialog({ open: true, editing: e })} className="rounded border border-border p-1.5 hover:bg-accent"><Pencil className="h-3 w-3" /></button>
                  <ConfirmButton onConfirm={() => crud.del(e.id)}><Trash2 className="h-3 w-3" /></ConfirmButton>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">لا توجد مصاريف.</td></tr>}
          </tbody>
        </table>
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل مصروف" : "إضافة مصروف"} fields={expenseFields}
          initial={dialog.editing ?? { paid: true, is_debt: false, expense_date: new Date().toISOString().slice(0, 10) }}
          onSubmit={async (v: any) => {
            await crud.save({ ...v, amount_egp: Number(v.amount_egp), category: v.category || null, notes: v.notes || null }, dialog.editing?.id);
          }} />
      )}
    </div>
  );
}

/* ============ SUBSCRIPTION PLANS ============ */
const planFields: Field[] = [
  { name: "name", label: "الاسم", required: true },
  { name: "description", label: "الوصف", type: "textarea" },
  { name: "price_egp", label: "السعر (ج.م)", type: "number", required: true },
  { name: "sessions_included", label: "عدد الجلسات", type: "number", required: true },
  { name: "duration_days", label: "المدة (أيام)", type: "number", required: true },
  { name: "sort_order", label: "الترتيب", type: "number" },
  { name: "is_active", label: "مفعّل", type: "boolean" },
];
export function SubscriptionPlansPanel() {
  const { data: plans = [] } = useQuery(subscriptionPlansQuery());
  const { data: subs = [] } = useQuery(customerSubsQuery());
  const crud = useCrud("subscription_plans", "subscription_plans");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-black">خطط الاشتراك</h3>
          <AddButton onClick={() => setDialog({ open: true })} label="إضافة خطة" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((p: any) => (
            <div key={p.id} className={`rounded-2xl border p-4 ${p.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
              <div className="font-bold">{p.name}</div>
              <div className="mt-1 text-2xl font-black text-gold">{p.price_egp} ج.م</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.sessions_included} جلسة • {p.duration_days} يوم</div>
              {p.description && <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>}
              <div className="mt-3 flex gap-1.5">
                <button onClick={() => setDialog({ open: true, editing: p })} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent"><IconEdit /></button>
                <button onClick={() => crud.toggle(p, "is_active")} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent">{p.is_active ? "تعطيل" : "تفعيل"}</button>
                <ConfirmButton onConfirm={() => crud.del(p.id)}><IconDelete /></ConfirmButton>
              </div>
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-full p-8 text-center text-muted-foreground">لا توجد خطط بعد.</div>}
        </div>
      </section>
      <section>
        <h3 className="mb-3 font-display text-lg font-black">اشتراكات العملاء ({subs.length})</h3>
        <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
              <th className="p-3 text-right">العميل</th><th className="p-3 text-right">الخطة</th>
              <th className="p-3 text-right">البدء</th><th className="p-3 text-right">الانتهاء</th><th className="p-3 text-right">الجلسات</th>
            </tr></thead>
            <tbody>
              {subs.map((s: any) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">{s.profiles?.full_name ?? "—"}<div className="text-xs text-muted-foreground">{s.profiles?.phone}</div></td>
                  <td className="p-3">{s.subscription_plans?.name}</td>
                  <td className="p-3 font-mono text-xs">{s.starts_on}</td>
                  <td className="p-3 font-mono text-xs">{s.ends_on}</td>
                  <td className="p-3">{s.sessions_used}</td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد اشتراكات نشطة.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل خطة" : "إضافة خطة"} fields={planFields}
          initial={dialog.editing ?? { is_active: true, duration_days: 30, sort_order: plans.length, sessions_included: 4 }}
          onSubmit={async (v: any) => {
            await crud.save({ ...v, price_egp: Number(v.price_egp), sessions_included: Number(v.sessions_included), duration_days: Number(v.duration_days), sort_order: Number(v.sort_order || 0), description: v.description || null }, dialog.editing?.id);
          }} />
      )}
    </div>
  );
}

/* ============ CONTENT PAGES ============ */
const contentFields: Field[] = [
  { name: "slug", label: "المعرّف (about/terms/privacy/faq)", required: true },
  { name: "title", label: "العنوان", required: true },
  { name: "body", label: "المحتوى", type: "textarea", required: true },
  { name: "seo_title", label: "عنوان SEO" },
  { name: "seo_description", label: "وصف SEO", type: "textarea" },
  { name: "is_published", label: "منشورة", type: "boolean" },
];
export function ContentPagesPanel() {
  const { data: rows = [] } = useQuery(contentPagesQuery());
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">صفحات النصوص (من نحن، الشروط، الخصوصية، FAQ). كل صفحة متاحة على المسار <code className="text-gold">/pages/&lt;slug&gt;</code></p>
        <AddButton onClick={() => setDialog({ open: true })} label="إضافة صفحة" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((p: any) => (
          <div key={p.slug} className={`rounded-2xl border p-4 ${p.is_published ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{p.title}</div>
                <code className="text-xs text-muted-foreground">/pages/{p.slug}</code>
              </div>
              <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> عرض</a>
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-muted-foreground whitespace-pre-wrap">{p.body}</p>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => setDialog({ open: true, editing: p })} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent"><IconEdit /> تعديل</button>
              <button onClick={async () => { await supabase.from("content_pages").update({ is_published: !p.is_published }).eq("slug", p.slug); qc.invalidateQueries({ queryKey: ["content_pages"] }); }} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent">{p.is_published ? "إخفاء" : "نشر"}</button>
              <ConfirmButton onConfirm={async () => { await supabase.from("content_pages").delete().eq("slug", p.slug); qc.invalidateQueries({ queryKey: ["content_pages"] }); }}><IconDelete /></ConfirmButton>
            </div>
          </div>
        ))}
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل صفحة" : "إضافة صفحة"} fields={contentFields}
          initial={dialog.editing ?? { is_published: true }}
          onSubmit={async (v: any) => {
            const payload = { ...v, seo_title: v.seo_title || null, seo_description: v.seo_description || null };
            const { error } = dialog.editing
              ? await supabase.from("content_pages").update(payload).eq("slug", dialog.editing.slug)
              : await supabase.from("content_pages").insert(payload);
            if (error) { toast.error(error.message); return; }
            toast.success("تم الحفظ");
            qc.invalidateQueries({ queryKey: ["content_pages"] });
          }} />
      )}
    </div>
  );
}

/* ============ BANNERS ============ */
const bannerFields: Field[] = [
  { name: "message", label: "النص", required: true, type: "textarea" },
  { name: "variant", label: "النوع (info / warning / success / promo)", placeholder: "info" },
  { name: "link_url", label: "رابط (اختياري)" },
  { name: "starts_at", label: "يبدأ (YYYY-MM-DDTHH:mm)" },
  { name: "ends_at", label: "ينتهي (YYYY-MM-DDTHH:mm)" },
  { name: "is_active", label: "مفعّل", type: "boolean" },
];
export function BannersPanel() {
  const { data: rows = [] } = useQuery(bannersQuery());
  const crud = useCrud("banners", "banners");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{rows.length} بانر</Badge>
        <AddButton onClick={() => setDialog({ open: true })} label="إضافة بانر" />
      </div>
      <div className="space-y-2">
        {rows.map((b: any) => (
          <div key={b.id} className={`flex items-center gap-3 rounded-xl border p-3 ${b.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
            <Badge variant="outline" className="shrink-0">{b.variant}</Badge>
            <div className="flex-1 truncate text-sm">{b.message}</div>
            <div className="hidden text-xs text-muted-foreground sm:block">
              {b.starts_at?.slice(0, 10) ?? "—"} → {b.ends_at?.slice(0, 10) ?? "∞"}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDialog({ open: true, editing: b })} className="rounded border border-border p-1.5 hover:bg-accent"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => crud.toggle(b, "is_active")} className="rounded border border-border p-1.5 hover:bg-accent">{b.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
              <ConfirmButton onConfirm={() => crud.del(b.id)}><Trash2 className="h-3 w-3" /></ConfirmButton>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="p-8 text-center text-muted-foreground">لا توجد بانرات.</div>}
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل بانر" : "إضافة بانر"} fields={bannerFields}
          initial={dialog.editing ?? { is_active: true, variant: "info" }}
          onSubmit={async (v: any) => {
            await crud.save({ ...v, link_url: v.link_url || null, starts_at: v.starts_at || null, ends_at: v.ends_at || null }, dialog.editing?.id);
          }} />
      )}
    </div>
  );
}

/* ============ PAYMENT METHODS ============ */
const pmFields: Field[] = [
  { name: "name", label: "الاسم", required: true },
  { name: "provider", label: "المزوّد", placeholder: "vodafone_cash / instapay / cash" },
  { name: "account_info", label: "رقم/معلومات الحساب" },
  { name: "instructions", label: "تعليمات للعميل", type: "textarea" },
  { name: "sort_order", label: "الترتيب", type: "number" },
  { name: "is_active", label: "مفعّلة", type: "boolean" },
];
export function PaymentMethodsPanel() {
  const { data: rows = [] } = useQuery(paymentMethodsQuery());
  const { data: proofs = [] } = useQuery(paymentProofsQuery());
  const crud = useCrud("payment_methods", "payment_methods");
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });

  async function proofAction(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("payment_proofs").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم");
    qc.invalidateQueries({ queryKey: ["payment_proofs"] });
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-black">وسائل الدفع</h3>
          <AddButton onClick={() => setDialog({ open: true })} label="إضافة وسيلة" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((p: any) => (
            <div key={p.id} className={`rounded-2xl border p-4 ${p.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.provider ?? "—"}</div>
                </div>
                <Switch checked={p.is_active} onCheckedChange={() => crud.toggle(p, "is_active")} />
              </div>
              {p.account_info && <div className="mt-2 rounded-lg bg-surface-elevated px-3 py-1.5 font-mono text-xs">{p.account_info}</div>}
              {p.instructions && <p className="mt-2 text-xs text-muted-foreground">{p.instructions}</p>}
              <div className="mt-3 flex gap-1.5">
                <button onClick={() => setDialog({ open: true, editing: p })} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent"><IconEdit /> تعديل</button>
                <ConfirmButton onConfirm={() => crud.del(p.id)}><IconDelete /></ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 font-display text-lg font-black">إثباتات الدفع ({proofs.length})</h3>
        <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
              <th className="p-3 text-right">العميل</th><th className="p-3 text-right">الوسيلة</th><th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">المرجع</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">إجراء</th>
            </tr></thead>
            <tbody>
              {proofs.map((p: any) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.profiles?.full_name ?? "—"}<div className="text-xs text-muted-foreground">{p.profiles?.phone}</div></td>
                  <td className="p-3 text-xs">{p.payment_methods?.name ?? "—"}</td>
                  <td className="p-3 font-bold text-gold">{Number(p.amount_egp).toFixed(0)}</td>
                  <td className="p-3 font-mono text-xs">{p.reference ?? "—"}</td>
                  <td className="p-3"><Badge variant="outline" className={p.status === "approved" ? "text-emerald-400" : p.status === "rejected" ? "text-destructive" : "text-amber-400"}>{p.status}</Badge></td>
                  <td className="p-3 flex gap-1">
                    {p.status === "pending" && (<>
                      <button onClick={() => proofAction(p.id, "approved")} className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"><Check className="h-3 w-3" /></button>
                      <button onClick={() => proofAction(p.id, "rejected")} className="rounded border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><X className="h-3 w-3" /></button>
                    </>)}
                    {p.image_url && <a href={p.image_url} target="_blank" rel="noreferrer" className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"><ExternalLink className="h-3 w-3" /></a>}
                  </td>
                </tr>
              ))}
              {proofs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا إثباتات دفع.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل وسيلة دفع" : "إضافة وسيلة دفع"} fields={pmFields}
          initial={dialog.editing ?? { is_active: true, sort_order: rows.length }}
          onSubmit={async (v: any) => {
            await crud.save({ ...v, sort_order: Number(v.sort_order || 0), account_info: v.account_info || null, instructions: v.instructions || null, provider: v.provider || null }, dialog.editing?.id);
          }} />
      )}
    </div>
  );
}

/* ============ BOOKING POLICIES / BLACKOUT / WAITLIST ============ */
export function BookingPoliciesPanel() {
  const { data: settings = {} } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const m: any = {}; for (const r of data ?? []) m[r.key] = r; return m;
    },
  });
  const { data: blackouts = [] } = useQuery(blackoutDatesQuery());
  const { data: waitlist = [] } = useQuery(waitlistQuery());
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any>({});
  const current = (settings as any).booking_policy?.value ?? {};
  const val = { ...current, ...draft };

  async function saveSettings() {
    const { error } = await supabase.from("site_settings").update({ value: val }).eq("key", "booking_policy");
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ السياسة");
    setDraft({});
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  const [newDate, setNewDate] = useState(""); const [newReason, setNewReason] = useState("");
  async function addBlackout() {
    if (!newDate) return;
    const { error } = await supabase.from("blackout_dates").insert({ blackout_date: newDate, reason: newReason || null });
    if (error) { toast.error(error.message); return; }
    setNewDate(""); setNewReason(""); toast.success("تم"); qc.invalidateQueries({ queryKey: ["blackout_dates"] });
  }
  async function delBlackout(id: string) {
    await supabase.from("blackout_dates").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["blackout_dates"] });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gold/10 bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-black">قواعد الحجز</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>أقل مدة مسبقة (دقائق)</Label><Input type="number" value={val.min_lead_minutes ?? 0} onChange={(e) => setDraft({ ...draft, min_lead_minutes: Number(e.target.value) })} /></div>
          <div><Label>فترة فاصلة بين الحجوزات (دقائق)</Label><Input type="number" value={val.buffer_minutes ?? 0} onChange={(e) => setDraft({ ...draft, buffer_minutes: Number(e.target.value) })} /></div>
          <div><Label>الحد الأقصى للحجوزات اليومية لكل حلاق</Label><Input type="number" value={val.max_daily_per_barber ?? 0} onChange={(e) => setDraft({ ...draft, max_daily_per_barber: Number(e.target.value) })} /></div>
          <div><Label>نافذة الإلغاء (ساعات قبل الموعد)</Label><Input type="number" value={val.cancel_window_hours ?? 0} onChange={(e) => setDraft({ ...draft, cancel_window_hours: Number(e.target.value) })} /></div>
        </div>
        <Button onClick={saveSettings} disabled={Object.keys(draft).length === 0} className="mt-4 bg-gold-gradient text-gold-foreground">حفظ القواعد</Button>
      </section>

      <section className="rounded-2xl border border-gold/10 bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-black">تواريخ محظورة (إجازات مفاجئة)</h3>
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-40" />
          <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="السبب (اختياري)" className="flex-1 min-w-[150px]" />
          <Button onClick={addBlackout} className="bg-gold-gradient text-gold-foreground">إضافة</Button>
        </div>
        <div className="mt-3 space-y-1">
          {blackouts.map((b: any) => (
            <div key={b.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated/50 px-3 py-2 text-sm">
              <CalendarX className="h-3.5 w-3.5 text-destructive" />
              <span className="font-mono">{b.blackout_date}</span>
              <span className="flex-1 text-xs text-muted-foreground">{b.reason ?? "—"}</span>
              <ConfirmButton onConfirm={() => delBlackout(b.id)}><Trash2 className="h-3 w-3" /></ConfirmButton>
            </div>
          ))}
          {blackouts.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">لا توجد أيام محظورة.</div>}
        </div>
      </section>

      <section className="rounded-2xl border border-gold/10 bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-black">قائمة الانتظار ({waitlist.length})</h3>
        <div className="space-y-2">
          {waitlist.map((w: any) => (
            <div key={w.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-elevated/50 p-3 text-sm">
              <div className="flex-1 min-w-[150px]">
                <div className="font-bold">{w.customer_name} <span className="font-mono text-xs text-muted-foreground">{w.customer_phone}</span></div>
                <div className="text-xs text-muted-foreground">{w.desired_date} {w.desired_time?.slice(0, 5) ?? ""} • {w.notes}</div>
              </div>
              <select value={w.status} onChange={async (e) => { await supabase.from("waitlist").update({ status: e.target.value }).eq("id", w.id); qc.invalidateQueries({ queryKey: ["waitlist"] }); }} className="rounded border border-border bg-input/40 px-2 py-1 text-xs">
                <option value="waiting">بانتظار</option><option value="contacted">تم التواصل</option><option value="booked">تم الحجز</option><option value="cancelled">ملغى</option>
              </select>
              <ConfirmButton onConfirm={async () => { await supabase.from("waitlist").delete().eq("id", w.id); qc.invalidateQueries({ queryKey: ["waitlist"] }); }}><Trash2 className="h-3 w-3" /></ConfirmButton>
            </div>
          ))}
          {waitlist.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">قائمة الانتظار فارغة.</div>}
        </div>
      </section>
    </div>
  );
}

/* ============ NOTIFICATION TEMPLATES ============ */
export function NotificationTemplatesPanel() {
  const { data: rows = [] } = useQuery(notificationTemplatesQuery());
  const { data: logs = [] } = useQuery(notificationsLogQuery());
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, any>>({});

  async function save(key: string) {
    const p = edits[key];
    if (!p) return;
    const { error } = await supabase.from("notification_templates").update(p).eq("key", key);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحفظ");
    setEdits((s) => { const c = { ...s }; delete c[key]; return c; });
    qc.invalidateQueries({ queryKey: ["notification_templates"] });
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 font-display text-lg font-black">قوالب الإشعارات</h3>
        <p className="mb-4 text-xs text-muted-foreground">استخدم متغيرات مثل <code>{"{name}"}</code>, <code>{"{date}"}</code>, <code>{"{time}"}</code>.</p>
        <div className="space-y-3">
          {rows.map((t: any) => {
            const cur = { ...t, ...(edits[t.key] ?? {}) };
            const dirty = !!edits[t.key];
            return (
              <div key={t.key} className="rounded-2xl border border-gold/10 bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div><div className="font-bold">{t.label}</div><code className="text-xs text-muted-foreground">{t.key}</code></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={cur.is_active} onCheckedChange={(v) => setEdits({ ...edits, [t.key]: { ...cur, is_active: v } })} />
                    <span className="text-xs">{cur.is_active ? "مفعّل" : "معطّل"}</span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select value={cur.channel} onChange={(e) => setEdits({ ...edits, [t.key]: { ...cur, channel: e.target.value } })} className="rounded-lg border border-border bg-input/40 px-3 py-2 text-sm">
                    <option value="inapp">داخل التطبيق</option><option value="email">بريد</option><option value="sms">SMS</option><option value="whatsapp">واتساب</option>
                  </select>
                  <Input value={cur.subject ?? ""} onChange={(e) => setEdits({ ...edits, [t.key]: { ...cur, subject: e.target.value } })} placeholder="الموضوع" className="sm:col-span-2" />
                </div>
                <Textarea rows={3} value={cur.body} onChange={(e) => setEdits({ ...edits, [t.key]: { ...cur, body: e.target.value } })} className="mt-2" />
                <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => save(t.key)} disabled={!dirty} className="bg-gold-gradient text-gold-foreground">حفظ</Button></div>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="mb-3 font-display text-lg font-black">سجل الإشعارات المرسلة ({logs.length})</h3>
        <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
              <th className="p-3 text-right">المستلم</th><th className="p-3 text-right">القالب</th><th className="p-3 text-right">القناة</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">التاريخ</th>
            </tr></thead>
            <tbody>
              {logs.slice(0, 100).map((l: any) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{l.recipient}</td><td className="p-3 text-xs">{l.template_key}</td>
                  <td className="p-3 text-xs">{l.channel}</td><td className="p-3 text-xs">{l.status}</td>
                  <td className="p-3 font-mono text-xs">{new Date(l.created_at).toLocaleString("ar-EG")}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لم يتم إرسال إشعارات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">💡 لإرسال SMS/بريد/واتساب حقيقي، يتطلب ربط مزوّد خارجي (Twilio / Resend). القوالب جاهزة للتفعيل بمجرد الربط.</p>
      </section>
    </div>
  );
}

/* ============ CRM ============ */
export function CRMPanel() {
  const { data: users = [] } = useQuery(usersAdminQuery());
  const { data: bookings = [] } = useQuery(allBookingsQuery());
  const { data: exts = [] } = useQuery(customerProfilesExtQuery());
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const extMap = useMemo(() => {
    const m: Record<string, any> = {}; for (const x of exts) m[x.user_id] = x; return m;
  }, [exts]);

  const enriched = useMemo(() => users.map((u: any) => {
    const own = bookings.filter((b: any) => b.user_id === u.id);
    const spent = own.filter((b: any) => b.status === "completed").reduce((s: number, b: any) => s + Number(b.price_egp), 0);
    const last = own[0]?.booking_date ?? null;
    return { ...u, visits: own.length, spent, last, ext: extMap[u.id] ?? {} };
  }), [users, bookings, extMap]);

  const filtered = enriched.filter((u: any) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  );

  async function toggleFlag(userId: string, field: "is_vip" | "is_blocked", cur: boolean) {
    const payload: any = { user_id: userId, [field]: !cur };
    const { error } = await supabase.from("customer_profiles_ext").upsert(payload, { onConflict: "user_id" });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer_profiles_ext"] });
  }
  async function saveNotes(userId: string, notes: string) {
    const payload: any = { user_id: userId, admin_notes: notes };
    const { error } = await supabase.from("customer_profiles_ext").upsert(payload, { onConflict: "user_id" });
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ الملاحظات");
    qc.invalidateQueries({ queryKey: ["customer_profiles_ext"] });
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="pr-10" />
        </div>
        <Badge variant="outline">{filtered.length} عميل</Badge>
        <Button variant="outline" size="sm" onClick={() => exportCSV("customers.csv", enriched.map((u: any) => ({
          id: u.id, name: u.full_name, phone: u.phone, visits: u.visits, spent: u.spent, last: u.last, vip: u.ext.is_vip, blocked: u.ext.is_blocked,
        })))}><Download className="h-3 w-3 ml-1" /> تصدير</Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((u: any) => {
          const isSelected = selected?.id === u.id;
          return (
            <div key={u.id} className={`rounded-2xl border p-4 ${u.ext.is_blocked ? "border-destructive/40 bg-destructive/5" : u.ext.is_vip ? "border-gold/40 bg-gold/5" : "border-gold/10 bg-card"}`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-bold">
                    {u.full_name ?? "—"}
                    {u.ext.is_vip && <Badge className="bg-gold-gradient text-gold-foreground">VIP</Badge>}
                    {u.ext.is_blocked && <Badge variant="destructive">محظور</Badge>}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{u.phone ?? "—"}</div>
                </div>
                <div className="text-left text-xs">
                  <div>{u.visits} زيارة</div>
                  <div className="font-bold text-gold">{u.spent.toFixed(0)} ج.م</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">آخر زيارة: {u.last ?? "—"}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => toggleFlag(u.id, "is_vip", u.ext.is_vip)} className={`rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent ${u.ext.is_vip ? "text-gold" : ""}`}><Star className="h-3 w-3 inline" /> VIP</button>
                <button onClick={() => toggleFlag(u.id, "is_blocked", u.ext.is_blocked)} className={`rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent ${u.ext.is_blocked ? "text-destructive" : ""}`}><Ban className="h-3 w-3 inline" /> حظر</button>
                <button onClick={() => setSelected(isSelected ? null : u)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-accent">{isSelected ? "إخفاء" : "الملف الكامل"}</button>
              </div>
              {isSelected && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <Label className="text-xs">ملاحظات خاصة</Label>
                  <Textarea rows={2} defaultValue={u.ext.admin_notes ?? ""} onBlur={(e) => saveNotes(u.id, e.target.value)} placeholder="مثلاً: يفضل قصة معينة، يتأخر أحياناً..." />
                  <div className="text-xs text-muted-foreground">آخر 5 حجوزات:</div>
                  <div className="space-y-1">
                    {bookings.filter((b: any) => b.user_id === u.id).slice(0, 5).map((b: any) => (
                      <div key={b.id} className="rounded-lg bg-surface-elevated/40 px-2 py-1 text-xs">
                        <span className="font-mono">{b.booking_date}</span> — {b.services?.name} — {b.status}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ INBOX ============ */
export function InboxPanel() {
  const { data: rows = [] } = useQuery(contactMessagesQuery());
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("unread");
  const shown = rows.filter((r: any) =>
    filter === "all" ? !r.is_archived : filter === "archived" ? r.is_archived : !r.is_read && !r.is_archived
  );
  async function upd(id: string, patch: any) {
    await supabase.from("contact_messages").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  }
  async function del(id: string) {
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  }
  const unread = rows.filter((r: any) => !r.is_read && !r.is_archived).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([["unread", `غير مقروءة${unread ? ` (${unread})` : ""}`], ["all", "الكل"], ["archived", "المؤرشفة"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as any)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === k ? "bg-gold-gradient text-gold-foreground" : "border border-border text-muted-foreground hover:bg-accent"}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-2">
        {shown.map((m: any) => (
          <div key={m.id} className={`rounded-2xl border p-4 ${m.is_read ? "border-border bg-card/50" : "border-gold/30 bg-gold/5"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-bold">{m.name}</div>
                  {m.phone && <a href={`tel:${m.phone}`} className="font-mono text-xs text-gold hover:underline">{m.phone}</a>}
                  {m.email && <a href={`mailto:${m.email}`} className="text-xs text-gold hover:underline">{m.email}</a>}
                </div>
                {m.subject && <div className="mt-1 text-sm font-bold">{m.subject}</div>}
                <p className="mt-1 whitespace-pre-wrap text-sm">{m.message}</p>
                <div className="mt-2 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString("ar-EG")}</div>
              </div>
              <div className="flex flex-col gap-1">
                {!m.is_read && <button onClick={() => upd(m.id, { is_read: true })} className="rounded border border-border p-1 text-xs hover:bg-accent" title="تحديد كمقروءة"><Check className="h-3 w-3" /></button>}
                <button onClick={() => upd(m.id, { is_archived: !m.is_archived })} className="rounded border border-border p-1 text-xs hover:bg-accent" title="أرشفة">{m.is_archived ? <RefreshCw className="h-3 w-3" /> : <Ban className="h-3 w-3" />}</button>
                <ConfirmButton onConfirm={() => del(m.id)}><Trash2 className="h-3 w-3" /></ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <div className="p-10 text-center text-muted-foreground">لا توجد رسائل.</div>}
      </div>
    </div>
  );
}

/* ============ AUDIT LOG ============ */
export function AuditLogPanel() {
  const { data: rows = [] } = useQuery(auditLogQuery());
  const { data: logins = [] } = useQuery(adminLoginLogQuery());
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-black">سجل عمليات الأدمن</h3>
          <Button variant="outline" size="sm" onClick={() => exportCSV("audit_log.csv", rows)}><Download className="h-3 w-3 ml-1" /> تصدير</Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
              <th className="p-3 text-right">الوقت</th><th className="p-3 text-right">الفاعل</th><th className="p-3 text-right">العملية</th><th className="p-3 text-right">الكيان</th>
            </tr></thead>
            <tbody>
              {rows.slice(0, 200).map((r: any) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{new Date(r.created_at).toLocaleString("ar-EG")}</td>
                  <td className="p-3 font-mono text-[10px] break-all">{r.actor_id?.slice(0, 8) ?? "—"}</td>
                  <td className="p-3"><Badge variant="outline">{r.action}</Badge></td>
                  <td className="p-3 text-xs">{r.entity_type} {r.entity_id && <code className="text-[10px] text-muted-foreground">{r.entity_id.slice(0, 8)}</code>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد عمليات مسجلة.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="mb-3 font-display text-lg font-black">سجل تسجيل دخول الأدمن</h3>
        <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
              <th className="p-3 text-right">الوقت</th><th className="p-3 text-right">المستخدم</th><th className="p-3 text-right">الحدث</th><th className="p-3 text-right">المتصفح</th>
            </tr></thead>
            <tbody>
              {logins.slice(0, 100).map((l: any) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{new Date(l.created_at).toLocaleString("ar-EG")}</td>
                  <td className="p-3 font-mono text-[10px]">{l.user_id?.slice(0, 8)}</td>
                  <td className="p-3 text-xs">{l.event}</td>
                  <td className="p-3 text-[10px] text-muted-foreground truncate max-w-[200px]">{l.user_agent}</td>
                </tr>
              ))}
              {logins.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد سجلات دخول بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ============ PERMISSIONS ============ */
const AVAILABLE_PERMS = ["cashier", "view_reports", "manage_bookings", "manage_services", "manage_customers", "manage_content"];
export function PermissionsPanel() {
  const { data: users = [] } = useQuery(usersAdminQuery());
  const { data: perms = [] } = useQuery(adminPermissionsQuery());
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const permMap = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const p of perms) (m[p.user_id] ||= new Set()).add(p.permission);
    return m;
  }, [perms]);

  async function togglePerm(userId: string, permission: string, has: boolean) {
    if (has) {
      await supabase.from("admin_permissions").delete().eq("user_id", userId).eq("permission", permission);
    } else {
      await supabase.from("admin_permissions").insert({ user_id: userId, permission });
    }
    qc.invalidateQueries({ queryKey: ["admin_permissions"] });
  }

  const filtered = users.filter((u: any) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">صلاحيات دقيقة تُسند لكل حساب على حدة، مستقلة عن دور "أدمن" الرئيسي. مثال: <b>cashier</b> يتيح فتح نظام الكاشير فقط.</p>
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن مستخدم..." className="pr-10" />
      </div>
      <div className="space-y-2">
        {filtered.slice(0, 50).map((u: any) => {
          const own = permMap[u.id] ?? new Set();
          return (
            <div key={u.id} className="rounded-2xl border border-gold/10 bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{u.full_name ?? "—"}</div>
                  <div className="font-mono text-[10px] text-muted-foreground break-all">{u.id}</div>
                </div>
                <Badge variant="outline">{own.size} صلاحية</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {AVAILABLE_PERMS.map((p) => {
                  const has = own.has(p);
                  return (
                    <button key={p} onClick={() => togglePerm(u.id, p, has)} className={`rounded-full px-3 py-1 text-xs font-bold transition ${has ? "bg-gold-gradient text-gold-foreground" : "border border-border text-muted-foreground hover:bg-accent"}`}>
                      {has ? "✓ " : "+ "}{p}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ REPORTS ============ */
export function ReportsPanel() {
  const { data: bookings = [] } = useQuery(allBookingsQuery());
  const { data: expenses = [] } = useQuery(expensesQuery());
  const [from, setFrom] = useState<string>(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const inRange = bookings.filter((b: any) => b.booking_date >= from && b.booking_date <= to);
  const revenue = inRange.filter((b: any) => b.status === "completed").reduce((s: number, b: any) => s + Number(b.price_egp), 0);
  const totalExp = expenses.filter((e: any) => e.expense_date >= from && e.expense_date <= to).reduce((s: number, e: any) => s + Number(e.amount_egp), 0);
  const net = revenue - totalExp;
  const noShow = inRange.filter((b: any) => b.status === "no_show").length;
  const noShowRate = inRange.length ? ((noShow / inRange.length) * 100).toFixed(1) : "0";

  // Barber ranking
  const byBarber: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const b of inRange) {
    const key = b.barbers?.name ?? "غير محدد";
    (byBarber[key] ||= { name: key, count: 0, revenue: 0 });
    byBarber[key].count++;
    if (b.status === "completed") byBarber[key].revenue += Number(b.price_egp);
  }
  const barberRank = Object.values(byBarber).sort((a, b) => b.revenue - a.revenue);

  // Customer ranking
  const byCust: Record<string, { name: string; phone: string; count: number; spent: number }> = {};
  for (const b of inRange) {
    const key = b.customer_phone ?? b.customer_name;
    (byCust[key] ||= { name: b.customer_name, phone: b.customer_phone, count: 0, spent: 0 });
    byCust[key].count++;
    if (b.status === "completed") byCust[key].spent += Number(b.price_egp);
  }
  const custRank = Object.values(byCust).sort((a, b) => b.spent - a.spent).slice(0, 10);

  // Heatmap: 7 days × 24 hours
  const heat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const b of inRange) {
    const d = new Date(b.booking_date + "T" + b.booking_time);
    heat[d.getDay()][d.getHours()]++;
  }
  const maxHeat = Math.max(1, ...heat.flat());
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div><Label>من</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div><Label>إلى</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(`report_${from}_${to}.csv`, inRange)}><Download className="h-3 w-3 ml-1" /> تصدير CSV</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Download className="h-3 w-3 ml-1" /> تصدير PDF (طباعة)</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">الإيرادات</div><div className="mt-1 text-xl font-black text-emerald-400">{revenue.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">المصاريف</div><div className="mt-1 text-xl font-black text-destructive">{totalExp.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">صافي الربح</div><div className={`mt-1 text-xl font-black ${net >= 0 ? "text-gold" : "text-destructive"}`}>{net.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">نسبة عدم الحضور</div><div className="mt-1 text-xl font-black text-amber-400">{noShowRate}%</div></div>
      </div>

      <section className="rounded-2xl border border-gold/10 bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-black">أوقات الذروة (Heatmap)</h3>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead><tr><th></th>{Array.from({ length: 24 }, (_, i) => <th key={i} className="w-6 p-0.5 text-center text-[9px] text-muted-foreground">{i}</th>)}</tr></thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d}>
                  <td className="pl-2 text-right text-[10px] text-muted-foreground">{d}</td>
                  {heat[i].map((v, h) => (
                    <td key={h} className="p-0.5">
                      <div className="h-5 w-5 rounded" style={{ background: v ? `hsl(45 90% ${70 - (v / maxHeat) * 40}%)` : "hsl(var(--muted))", opacity: v ? 0.4 + (v / maxHeat) * 0.6 : 0.2 }} title={`${d} ${h}:00 — ${v} حجز`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/10 bg-card p-5">
          <h3 className="mb-3 font-display text-lg font-black">ترتيب الحلاقين</h3>
          {barberRank.map((b, i) => (
            <div key={b.name} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="font-bold"><span className="text-gold">#{i + 1}</span> {b.name}</span>
              <div className="text-left"><div className="font-bold text-gold">{b.revenue.toFixed(0)} ج.م</div><div className="text-xs text-muted-foreground">{b.count} حجز</div></div>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border border-gold/10 bg-card p-5">
          <h3 className="mb-3 font-display text-lg font-black">أفضل العملاء</h3>
          {custRank.map((c, i) => (
            <div key={c.phone} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <div><div className="font-bold"><span className="text-gold">#{i + 1}</span> {c.name}</div><div className="font-mono text-xs text-muted-foreground">{c.phone}</div></div>
              <div className="text-left"><div className="font-bold text-gold">{c.spent.toFixed(0)} ج.م</div><div className="text-xs text-muted-foreground">{c.count} حجز</div></div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

/* ============ POS (كاشير) ============ */
export function POSPanel() {
  const { data: rows = [] } = useQuery(posTransactionsQuery());
  const total = rows.reduce((s: number, r: any) => s + Number(r.total_egp), 0);
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">يظهر هنا كل معاملات الكاشير — تتم من قِبل حسابات لديها صلاحية <b>cashier</b>. إضافة معاملة يدوية:</p>
      <QuickPOSForm />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">عدد المعاملات</div><div className="mt-1 text-xl font-black">{rows.length}</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">إجمالي المبالغ</div><div className="mt-1 text-xl font-black text-gold">{total.toFixed(0)} ج.م</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-xs text-muted-foreground">اليوم</div><div className="mt-1 text-xl font-black">{rows.filter((r: any) => r.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</div></div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs text-muted-foreground"><tr>
            <th className="p-3 text-right">الوقت</th><th className="p-3 text-right">العميل</th><th className="p-3 text-right">البنود</th><th className="p-3 text-right">الإجمالي</th><th className="p-3 text-right">الدفع</th>
          </tr></thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{new Date(r.created_at).toLocaleString("ar-EG")}</td>
                <td className="p-3">{r.customer_name ?? "—"}<div className="text-xs text-muted-foreground">{r.customer_phone}</div></td>
                <td className="p-3 text-xs">{Array.isArray(r.items) ? r.items.map((i: any) => i.name).join(", ") : "—"}</td>
                <td className="p-3 font-bold text-gold">{Number(r.total_egp).toFixed(0)}</td>
                <td className="p-3 text-xs">{r.payment_method ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد معاملات.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function QuickPOSForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", item: "", total: "", payment_method: "cash" });
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!form.total) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("pos_transactions").insert({
      cashier_id: u.user?.id, customer_name: form.customer_name || null, customer_phone: form.customer_phone || null,
      items: form.item ? [{ name: form.item, price: Number(form.total) }] : [],
      subtotal_egp: Number(form.total), total_egp: Number(form.total), payment_method: form.payment_method,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت المعاملة");
    setForm({ customer_name: "", customer_phone: "", item: "", total: "", payment_method: "cash" });
    qc.invalidateQueries({ queryKey: ["pos_transactions"] });
  }
  return (
    <div className="glass grid gap-2 rounded-2xl p-3 sm:grid-cols-6">
      <Input placeholder="اسم العميل" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="sm:col-span-2" />
      <Input placeholder="الهاتف" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
      <Input placeholder="الخدمة" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
      <Input placeholder="المبلغ" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
      <div className="flex gap-1">
        <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="flex-1 rounded-lg border border-border bg-input/40 px-2 text-sm">
          <option value="cash">نقدي</option><option value="vodafone">فودافون</option><option value="instapay">انستاباي</option>
        </select>
        <Button size="sm" onClick={submit} disabled={busy} className="bg-gold-gradient text-gold-foreground">تسجيل</Button>
      </div>
    </div>
  );
}

/* ============ BACKUP ============ */
export function BackupPanel() {
  const [busy, setBusy] = useState(false);
  async function backup() {
    setBusy(true);
    try {
      const tables = ["profiles", "user_roles", "services", "barbers", "bookings", "reviews", "gallery_images", "site_settings",
        "promotions", "expenses", "subscription_plans", "customer_subscriptions", "audit_log", "customer_points", "points_transactions",
        "blackout_dates", "waitlist", "customer_profiles_ext", "payment_methods", "payment_proofs", "notification_templates", "notifications_log",
        "content_pages", "banners", "contact_messages", "admin_login_log", "admin_permissions", "pos_transactions"];
      const dump: Record<string, any> = { exported_at: new Date().toISOString() };
      for (const t of tables) {
        const { data } = await (supabase.from as any)(t).select("*");
        dump[t] = data ?? [];
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `haroun-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير النسخة الاحتياطية");
    } catch (e: any) {
      toast.error("خطأ: " + e.message);
    } finally { setBusy(false); }
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/10 bg-card p-6">
        <h3 className="font-display text-lg font-black">تصدير نسخة احتياطية كاملة</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          يصدّر ملف JSON واحد يحتوي على كل بيانات الصالون: العملاء، الحجوزات، الخدمات، الحلاقين، التقييمات، المصاريف، الاشتراكات، الإعدادات، وكل شيء آخر.
          احتفظ به في مكان آمن.
        </p>
        <Button onClick={backup} disabled={busy} className="mt-4 bg-gold-gradient text-gold-foreground shadow-gold">
          <Download className="h-4 w-4 ml-2" /> {busy ? "جارٍ التصدير..." : "تصدير النسخة الاحتياطية"}
        </Button>
      </div>
    </div>
  );
}

/* ============ Nav helpers (icons re-export) ============ */
export const SectionIcons = {
  Tag, Wallet, CreditCard, CalendarX, Clock3, MessageSquare, FileText, Megaphone,
  Bell, ShieldCheck, ClipboardList, BarChart3,
};
