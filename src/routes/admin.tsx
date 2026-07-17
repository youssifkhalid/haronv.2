import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarCheck, Clock, User, Phone, Scissors, Users, TrendingUp, DollarSign, Star, Check, X as XIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth, useRoles } from "@/lib/auth";
import { allBookingsQuery, servicesQuery, allReviewsQuery, barbersQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — صالون هارون" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const statuses = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
const statusLabel: Record<string, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي", no_show: "لم يحضر",
};

function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles(user?.id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"bookings" | "services" | "barbers" | "reviews">("bookings");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [loading, user, navigate]);

  const { data: bookings = [] } = useQuery({ ...allBookingsQuery(), enabled: !!user && isAdmin });
  const { data: services = [] } = useQuery({ ...servicesQuery(), enabled: !!user && isAdmin });
  const { data: barbers = [] } = useQuery({ ...barbersQuery(), enabled: !!user && isAdmin });
  const { data: reviews = [] } = useQuery({ ...allReviewsQuery(), enabled: !!user && isAdmin });

  if (loading || rolesLoading) return <SiteLayout><div className="p-10 text-center">جارٍ التحميل...</div></SiteLayout>;

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="text-xs font-black tracking-[0.35em] text-gold">ممنوع الوصول</div>
          <h1 className="mt-3 font-display text-3xl font-black">هذه الصفحة للإدارة فقط</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            إذا كنت مالك الصالون، اطلب من دعم النظام إسناد صلاحية "admin" لحسابك من قاعدة البيانات.
          </p>
          <div className="mt-5 inline-block rounded-lg bg-surface-elevated px-4 py-2 text-xs text-muted-foreground font-mono">
            user_id: {user?.id}
          </div>
        </div>
      </SiteLayout>
    );
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  async function moderateReview(id: string, approve: boolean) {
    const { error } = await supabase.from("reviews").update({ is_approved: approve }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? "تم اعتماد التقييم" : "تم إخفاء التقييم");
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }

  async function deleteReview(id: string) {
    if (!confirm("حذف هذا التقييم نهائياً؟")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }

  async function toggleBarber(id: string, active: boolean) {
    const { error } = await supabase.from("barbers").update({ is_active: !active }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["barbers"] });
  }

  async function toggleService(id: string, active: boolean) {
    const { error } = await supabase.from("services").update({ is_active: !active }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["services"] });
  }


  const stats = {
    total: bookings.length,
    today: bookings.filter((b: any) => b.booking_date === new Date().toISOString().slice(0,10)).length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    revenue: bookings.filter((b: any) => b.status === "completed").reduce((sum: number, b: any) => sum + Number(b.price_egp), 0),
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header className="mb-6">
          <div className="text-xs font-black tracking-[0.35em] text-gold">لوحة الإدارة</div>
          <h1 className="mt-2 font-display text-3xl font-black">إدارة صالون هارون</h1>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={CalendarCheck} label="إجمالي الحجوزات" value={stats.total} />
          <Stat icon={Clock} label="اليوم" value={stats.today} />
          <Stat icon={Users} label="بانتظار التأكيد" value={stats.pending} />
          <Stat icon={DollarSign} label="الإيرادات (المكتملة)" value={`${stats.revenue.toFixed(0)} ج.م`} />
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
          {([
            ["bookings", "الحجوزات"],
            ["services", "الخدمات"],
            ["barbers", "الحلاقين"],
            ["reviews", `التقييمات${reviews.filter((r:any)=>!r.is_approved).length ? ` (${reviews.filter((r:any)=>!r.is_approved).length})` : ""}`],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t as any)} className={`px-5 py-3 text-sm font-bold transition ${tab === t ? "border-b-2 border-gold text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "bookings" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3 text-right">العميل</th>
                    <th className="p-3 text-right">الخدمة</th>
                    <th className="p-3 text-right">الحلاق</th>
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 text-right">الوقت</th>
                    <th className="p-3 text-right">السعر</th>
                    <th className="p-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="border-t border-border hover:bg-accent/20">
                      <td className="p-3">
                        <div className="font-bold">{b.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{b.customer_phone}</div>
                      </td>
                      <td className="p-3">{b.services?.name}</td>
                      <td className="p-3">{b.barbers?.name ?? "—"}</td>
                      <td className="p-3">{b.booking_date}</td>
                      <td className="p-3">{String(b.booking_time).slice(0,5)}</td>
                      <td className="p-3 font-bold text-gold">{b.price_egp}</td>
                      <td className="p-3">
                        <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="rounded-lg border border-border bg-input/40 px-2 py-1 text-xs">
                          {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">لا توجد حجوزات بعد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "services" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-gold/10 bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{s.name}</h3>
                  <span className="font-black text-gold">{s.price_egp} ج.م</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{s.duration_minutes} دقيقة</div>
                  <button onClick={() => toggleService(s.id, s.is_active)} className="rounded-lg border border-border px-3 py-1 text-xs font-bold hover:bg-accent">
                    {s.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "barbers" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((b: any) => (
              <div key={b.id} className="rounded-2xl border border-gold/10 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{b.name}</h3>
                    <div className="text-xs text-muted-foreground">{b.title ?? "—"}</div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-gold"><Star className="h-3.5 w-3.5 fill-gold" /> {Number(b.rating ?? 5).toFixed(1)}</div>
                </div>
                {b.bio && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{b.bio}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-bold ${b.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {b.is_active ? "مفعّل" : "معطّل"}
                  </span>
                  <button onClick={() => toggleBarber(b.id, b.is_active)} className="rounded-lg border border-border px-3 py-1 text-xs font-bold hover:bg-accent">
                    {b.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </div>
              </div>
            ))}
            {barbers.length === 0 && (
              <div className="col-span-full p-10 text-center text-muted-foreground">لا يوجد حلاقين نشطين.</div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {reviews.map((r: any) => (
              <article key={r.id} className={`rounded-2xl border p-4 ${r.is_approved ? "border-gold/10 bg-card" : "border-amber-500/40 bg-amber-500/5"}`}>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-0.5 text-gold">
                    {[1,2,3,4,5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${r.rating >= n ? "fill-gold" : "opacity-30"}`} />)}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.is_approved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {r.is_approved ? "معتمد" : "بانتظار المراجعة"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
                  <div className="flex gap-2">
                    <button onClick={() => moderateReview(r.id, !r.is_approved)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-bold hover:bg-accent">
                      {r.is_approved ? <><XIcon className="h-3 w-3" /> إخفاء</> : <><Check className="h-3 w-3" /> اعتماد</>}
                    </button>
                    <button onClick={() => deleteReview(r.id)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2 py-1 font-bold text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full p-10 text-center text-muted-foreground">لا توجد تقييمات بعد.</div>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-0.5 truncate text-lg font-black">{value}</div>
        </div>
      </div>
    </div>
  );
}
