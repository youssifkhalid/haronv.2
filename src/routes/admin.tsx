import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck, Clock, Users, DollarSign, LayoutDashboard, Scissors, UserCog, Image as ImageIcon,
  Star, Settings, Shield, LogOut, Menu, X as XIcon, Check, Search, TrendingUp, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, useRoles } from "@/lib/auth";
import {
  allBookingsQuery, allServicesQuery, allBarbersQuery, allReviewsQuery,
  allGalleryQuery, siteSettingsQuery, usersAdminQuery,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EntityDialog, ConfirmButton, AddButton, IconEdit, IconDelete, type Field } from "@/components/admin/EntityDialog";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — صالون هارون" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Section = "overview" | "bookings" | "services" | "barbers" | "gallery" | "reviews" | "users" | "settings";

const nav: { key: Section; label: string; icon: any }[] = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "bookings", label: "الحجوزات", icon: CalendarCheck },
  { key: "services", label: "الخدمات", icon: Scissors },
  { key: "barbers", label: "الحلاقين", icon: UserCog },
  { key: "gallery", label: "المعرض", icon: ImageIcon },
  { key: "reviews", label: "التقييمات", icon: Star },
  { key: "users", label: "المستخدمون", icon: Users },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles(user?.id);
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [loading, user, navigate]);

  if (loading || rolesLoading) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">جارٍ التحميل...</div>;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-lg text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive"><Shield className="h-8 w-8" /></div>
          <h1 className="mt-5 font-display text-3xl font-black">ممنوع الوصول</h1>
          <p className="mt-3 text-sm text-muted-foreground">هذه الصفحة مخصصة للإدارة فقط. اطلب من مالك النظام إسناد صلاحية "admin" لحسابك.</p>
          <div className="mt-4 inline-block rounded-lg bg-surface-elevated px-4 py-2 text-xs text-muted-foreground font-mono break-all">{user?.id}</div>
          <div className="mt-6"><Link to="/" className="text-sm text-gold hover:underline">← العودة للرئيسية</Link></div>
        </div>
      </div>
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 transform border-l border-gold/10 bg-surface-elevated/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-gold/10 p-5">
            <Logo size={44} />
            <div className="mt-3 text-[10px] font-black tracking-[0.3em] text-gold/70">ADMIN PANEL</div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {nav.map((n) => (
              <button key={n.key} onClick={() => { setSection(n.key); setSidebarOpen(false); }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${section === n.key ? "bg-gold-gradient text-gold-foreground shadow-gold" : "text-foreground/70 hover:bg-accent/40 hover:text-gold"}`}>
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="space-y-1 border-t border-gold/10 p-3">
            <Link to="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-accent/40 hover:text-gold">
              <LayoutDashboard className="h-4 w-4" /> عرض الموقع
            </Link>
            <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <button onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" aria-label="إغلاق" />}

      {/* Main */}
      <div className="lg:mr-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gold/10 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-border p-2 lg:hidden" aria-label="القائمة">
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <div className="text-[10px] font-black tracking-[0.3em] text-gold">لوحة الإدارة</div>
              <h1 className="font-display text-lg font-black">{nav.find((n) => n.key === section)?.label}</h1>
            </div>
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</div>
        </header>

        <main className="p-4 sm:p-6">
          {section === "overview" && <OverviewPanel />}
          {section === "bookings" && <BookingsPanel />}
          {section === "services" && <ServicesPanel />}
          {section === "barbers" && <BarbersPanel />}
          {section === "gallery" && <GalleryPanel />}
          {section === "reviews" && <ReviewsPanel />}
          {section === "users" && <UsersPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

/* =============================== OVERVIEW =============================== */
function OverviewPanel() {
  const { data: bookings = [] } = useQuery(allBookingsQuery());
  const { data: services = [] } = useQuery(allServicesQuery());
  const { data: barbers = [] } = useQuery(allBarbersQuery());
  const { data: reviews = [] } = useQuery(allReviewsQuery());

  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    total: bookings.length,
    today: bookings.filter((b: any) => b.booking_date === today).length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    completed: bookings.filter((b: any) => b.status === "completed").length,
    revenue: bookings.filter((b: any) => b.status === "completed").reduce((s: number, b: any) => s + Number(b.price_egp), 0),
    services: services.length,
    barbers: barbers.length,
    pendingReviews: reviews.filter((r: any) => !r.is_approved).length,
  };

  const upcoming = [...bookings]
    .filter((b: any) => b.booking_date >= today && b.status !== "cancelled")
    .sort((a: any, b: any) => (a.booking_date + a.booking_time).localeCompare(b.booking_date + b.booking_time))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="إجمالي الحجوزات" value={stats.total} tone="gold" />
        <StatCard icon={Clock} label="حجوزات اليوم" value={stats.today} tone="emerald" />
        <StatCard icon={TrendingUp} label="بانتظار التأكيد" value={stats.pending} tone="amber" />
        <StatCard icon={DollarSign} label="الإيرادات (مكتملة)" value={`${stats.revenue.toFixed(0)} ج.م`} tone="gold" />
        <StatCard icon={Check} label="الحجوزات المكتملة" value={stats.completed} tone="emerald" />
        <StatCard icon={Scissors} label="الخدمات" value={stats.services} />
        <StatCard icon={UserCog} label="الحلاقين" value={stats.barbers} />
        <StatCard icon={Star} label="تقييمات بانتظار المراجعة" value={stats.pendingReviews} tone={stats.pendingReviews ? "amber" : "muted"} />
      </div>

      <section className="rounded-2xl border border-gold/10 bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-black">الحجوزات القادمة</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد حجوزات قادمة.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-elevated/40 p-3 text-sm">
                <div>
                  <div className="font-bold">{b.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{b.services?.name} • {b.barbers?.name ?? "أي حلاق"}</div>
                </div>
                <div className="text-left">
                  <div className="font-mono text-xs">{b.booking_date}</div>
                  <div className="font-mono text-xs text-gold">{String(b.booking_time).slice(0, 5)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "gold" }: any) {
  const toneClass = {
    gold: "bg-gold/10 text-gold",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    muted: "bg-muted text-muted-foreground",
  }[tone as string];
  return (
    <div className="glass rounded-2xl p-4 transition hover:border-gold/30">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass}`}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="mt-0.5 truncate text-xl font-black">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* =============================== BOOKINGS =============================== */
const statuses = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
const statusLabel: Record<string, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي", no_show: "لم يحضر",
};
const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/10 text-destructive",
};

function BookingsPanel() {
  const qc = useQueryClient();
  const { data: bookings = [] } = useQuery(allBookingsQuery());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => bookings.filter((b: any) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return b.customer_name?.toLowerCase().includes(s) || b.customer_phone?.includes(s) || b.services?.name?.toLowerCase().includes(s);
  }), [bookings, search, statusFilter]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  async function deleteBooking(id: string) {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف الحجز");
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف أو الخدمة..." className="pr-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-border bg-input/40 px-3 py-2 text-sm">
          <option value="all">كل الحالات</option>
          {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <Badge variant="outline" className="text-xs">{filtered.length} من {bookings.length}</Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs font-bold text-muted-foreground">
              <tr>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">الخدمة</th>
                <th className="p-3 text-right">الحلاق</th>
                <th className="p-3 text-right">التاريخ</th>
                <th className="p-3 text-right">الوقت</th>
                <th className="p-3 text-right">السعر</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b: any) => (
                <tr key={b.id} className="border-t border-border hover:bg-accent/10">
                  <td className="p-3">
                    <div className="font-bold">{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{b.customer_phone}</div>
                    {b.notes && <div className="mt-1 text-xs text-muted-foreground line-clamp-1">📝 {b.notes}</div>}
                  </td>
                  <td className="p-3">{b.services?.name}</td>
                  <td className="p-3">{b.barbers?.name ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">{b.booking_date}</td>
                  <td className="p-3 font-mono text-xs">{String(b.booking_time).slice(0, 5)}</td>
                  <td className="p-3 font-bold text-gold">{Number(b.price_egp).toFixed(0)}</td>
                  <td className="p-3">
                    <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}
                      className={`rounded-lg border border-border px-2 py-1 text-xs font-bold ${statusColor[b.status]}`}>
                      {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <ConfirmButton onConfirm={() => deleteBooking(b.id)} message="حذف الحجز نهائياً؟">
                      <IconDelete />
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">لا توجد حجوزات مطابقة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =============================== SERVICES =============================== */
const serviceFields: Field[] = [
  { name: "name", label: "اسم الخدمة", required: true },
  { name: "description", label: "الوصف", type: "textarea" },
  { name: "price_egp", label: "السعر (ج.م)", type: "number", required: true },
  { name: "duration_minutes", label: "المدة (دقائق)", type: "number", required: true },
  { name: "icon", label: "الأيقونة (اسم رمز)", placeholder: "scissors" },
  { name: "sort_order", label: "الترتيب", type: "number" },
  { name: "is_active", label: "مفعّلة", type: "boolean" },
];

function ServicesPanel() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery(allServicesQuery());
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });

  async function save(v: any) {
    const payload = { ...v, price_egp: Number(v.price_egp), duration_minutes: Number(v.duration_minutes), sort_order: Number(v.sort_order || 0) };
    const { error } = dialog.editing
      ? await supabase.from("services").update(payload).eq("id", dialog.editing.id)
      : await supabase.from("services").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(dialog.editing ? "تم تحديث الخدمة" : "تم إضافة الخدمة");
    qc.invalidateQueries({ queryKey: ["services"] });
  }

  async function del(id: string) {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message.includes("foreign key") ? "لا يمكن حذف خدمة مرتبطة بحجوزات — عطّلها بدلاً من الحذف" : error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["services"] });
  }

  async function toggle(s: any) {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    qc.invalidateQueries({ queryKey: ["services"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Badge variant="outline">{services.length} خدمة</Badge>
        <AddButton onClick={() => setDialog({ open: true })} label="إضافة خدمة" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s: any) => (
          <div key={s.id} className={`rounded-2xl border p-4 transition ${s.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold truncate">{s.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
              </div>
              <span className="shrink-0 font-black text-gold">{s.price_egp} ج.م</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>⏱ {s.duration_minutes}د</span>
              <span>#{s.sort_order}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button onClick={() => setDialog({ open: true, editing: s })} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent"><IconEdit /> تعديل</button>
              <button onClick={() => toggle(s)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent">
                {s.is_active ? <><EyeOff className="h-3.5 w-3.5" /> تعطيل</> : <><Eye className="h-3.5 w-3.5" /> تفعيل</>}
              </button>
              <ConfirmButton onConfirm={() => del(s.id)}><IconDelete /> حذف</ConfirmButton>
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="col-span-full p-10 text-center text-muted-foreground">لا توجد خدمات — أضف أول خدمة.</div>}
      </div>

      {dialog.open && (
        <EntityDialog
          open={dialog.open}
          onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل الخدمة" : "إضافة خدمة"}
          fields={serviceFields}
          initial={dialog.editing ?? { is_active: true, sort_order: services.length, duration_minutes: 30 }}
          onSubmit={save}
        />
      )}
    </div>
  );
}

/* =============================== BARBERS =============================== */
const barberFields: Field[] = [
  { name: "name", label: "الاسم", required: true },
  { name: "title", label: "المسمى الوظيفي", placeholder: "حلاق أول" },
  { name: "bio", label: "نبذة", type: "textarea" },
  { name: "photo_url", label: "رابط الصورة", type: "url", placeholder: "https://..." },
  { name: "rating", label: "التقييم (1-5)", type: "number" },
  { name: "sort_order", label: "الترتيب", type: "number" },
  { name: "is_active", label: "مفعّل", type: "boolean" },
];

function BarbersPanel() {
  const qc = useQueryClient();
  const { data: barbers = [] } = useQuery(allBarbersQuery());
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });

  async function save(v: any) {
    const payload: any = { ...v, rating: v.rating ? Number(v.rating) : null, sort_order: Number(v.sort_order || 0) };
    if (!payload.photo_url) payload.photo_url = null;
    const { error } = dialog.editing
      ? await supabase.from("barbers").update(payload).eq("id", dialog.editing.id)
      : await supabase.from("barbers").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(dialog.editing ? "تم التحديث" : "تمت الإضافة");
    qc.invalidateQueries({ queryKey: ["barbers"] });
  }
  async function del(id: string) {
    const { error } = await supabase.from("barbers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["barbers"] });
  }
  async function toggle(b: any) {
    await supabase.from("barbers").update({ is_active: !b.is_active }).eq("id", b.id);
    qc.invalidateQueries({ queryKey: ["barbers"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Badge variant="outline">{barbers.length} حلاق</Badge>
        <AddButton onClick={() => setDialog({ open: true })} label="إضافة حلاق" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((b: any) => (
          <div key={b.id} className={`overflow-hidden rounded-2xl border transition ${b.is_active ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-70"}`}>
            {b.photo_url ? (
              <img src={b.photo_url} alt={b.name} className="h-40 w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
            ) : (
              <div className="grid h-40 place-items-center bg-gold-gradient text-4xl font-black text-gold-foreground">{b.name.charAt(0)}</div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{b.name}</h3>
                  <div className="text-xs text-muted-foreground">{b.title ?? "—"}</div>
                </div>
                <div className="inline-flex items-center gap-1 text-gold"><Star className="h-3.5 w-3.5 fill-current" /> {Number(b.rating ?? 5).toFixed(1)}</div>
              </div>
              {b.bio && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => setDialog({ open: true, editing: b })} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent"><IconEdit /> تعديل</button>
                <button onClick={() => toggle(b)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent">
                  {b.is_active ? <><EyeOff className="h-3.5 w-3.5" /> تعطيل</> : <><Eye className="h-3.5 w-3.5" /> تفعيل</>}
                </button>
                <ConfirmButton onConfirm={() => del(b.id)}><IconDelete /> حذف</ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {barbers.length === 0 && <div className="col-span-full p-10 text-center text-muted-foreground">لا يوجد حلاقين — أضف أول حلاق.</div>}
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل الحلاق" : "إضافة حلاق"} fields={barberFields}
          initial={dialog.editing ?? { is_active: true, rating: 5, sort_order: barbers.length }}
          onSubmit={save} />
      )}
    </div>
  );
}

/* =============================== GALLERY =============================== */
const galleryFields: Field[] = [
  { name: "title", label: "العنوان", placeholder: "الصالون الداخلي" },
  { name: "image_url", label: "رابط الصورة", type: "url", required: true, placeholder: "https://..." },
  { name: "alt_text", label: "الوصف (لذوي الاحتياجات وSEO)" },
  { name: "category", label: "التصنيف", placeholder: "الديكور / الحلاقة / الأدوات" },
  { name: "sort_order", label: "الترتيب", type: "number" },
  { name: "is_featured", label: "مميّزة (تظهر بحجم أكبر)", type: "boolean" },
  { name: "is_visible", label: "ظاهرة للعملاء", type: "boolean" },
];

function GalleryPanel() {
  const qc = useQueryClient();
  const { data: images = [] } = useQuery(allGalleryQuery());
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });

  async function save(v: any) {
    const payload = { ...v, sort_order: Number(v.sort_order || 0) };
    for (const k of ["title", "alt_text", "category"]) if (!payload[k]) payload[k] = null;
    const { error } = dialog.editing
      ? await supabase.from("gallery_images").update(payload).eq("id", dialog.editing.id)
      : await supabase.from("gallery_images").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(dialog.editing ? "تم التحديث" : "تمت إضافة الصورة");
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }
  async function del(id: string) {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }
  async function toggle(g: any, key: "is_visible" | "is_featured") {
    const patch: any = { [key]: !g[key] };
    await supabase.from("gallery_images").update(patch).eq("id", g.id);
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline">{images.length} صورة</Badge>
          <Badge variant="outline" className="text-emerald-400">{images.filter((i: any) => i.is_visible).length} ظاهرة</Badge>
        </div>
        <AddButton onClick={() => setDialog({ open: true })} label="إضافة صورة" />
      </div>
      <p className="text-xs text-muted-foreground">💡 أضف الصور برابط مباشر (يمكن استخدام Cloudinary أو Imgur أو أي مضيف). أخفِ الصورة بدل حذفها للحفاظ على الروابط.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((g: any) => (
          <div key={g.id} className={`group overflow-hidden rounded-2xl border transition ${g.is_visible ? "border-gold/10 bg-card" : "border-border bg-muted/20 opacity-60"}`}>
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img src={g.image_url} alt={g.alt_text ?? g.title ?? ""} loading="lazy" className="h-full w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23222' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23888' font-size='10'%3Eلا توجد صورة%3C/text%3E%3C/svg%3E")} />
              {g.is_featured && <span className="absolute top-2 right-2 rounded-full bg-gold-gradient px-2 py-0.5 text-[10px] font-black text-gold-foreground">مميّزة</span>}
              {!g.is_visible && <span className="absolute top-2 left-2 rounded-full bg-destructive/80 px-2 py-0.5 text-[10px] font-black text-destructive-foreground">مخفية</span>}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-bold">{g.title ?? "بدون عنوان"}</div>
              {g.category && <div className="text-xs text-muted-foreground">{g.category}</div>}
              <div className="mt-2 flex flex-wrap gap-1">
                <button onClick={() => setDialog({ open: true, editing: g })} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold hover:bg-accent"><IconEdit /></button>
                <button onClick={() => toggle(g, "is_visible")} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold hover:bg-accent">{g.is_visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                <button onClick={() => toggle(g, "is_featured")} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold hover:bg-accent"><Star className={`h-3 w-3 ${g.is_featured ? "fill-gold text-gold" : ""}`} /></button>
                <ConfirmButton onConfirm={() => del(g.id)}><IconDelete /></ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && <div className="col-span-full p-10 text-center text-muted-foreground">لا توجد صور بعد — أضف أول صورة للمعرض.</div>}
      </div>
      {dialog.open && (
        <EntityDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}
          title={dialog.editing ? "تعديل صورة" : "إضافة صورة"} fields={galleryFields}
          initial={dialog.editing ?? { is_visible: true, is_featured: false, sort_order: images.length }}
          onSubmit={save} />
      )}
    </div>
  );
}

/* =============================== REVIEWS =============================== */
function ReviewsPanel() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery(allReviewsQuery());
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const shown = reviews.filter((r: any) =>
    filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved
  );

  async function moderate(id: string, approve: boolean) {
    const { error } = await supabase.from("reviews").update({ is_approved: approve }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? "تم الاعتماد" : "تم الإخفاء");
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }
  async function del(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }

  const pending = reviews.filter((r: any) => !r.is_approved).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([["all", "الكل"], ["pending", `بانتظار المراجعة${pending ? ` (${pending})` : ""}`], ["approved", "المعتمدة"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as any)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter === k ? "bg-gold-gradient text-gold-foreground" : "border border-border text-muted-foreground hover:bg-accent"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {shown.map((r: any) => (
          <article key={r.id} className={`rounded-2xl border p-4 ${r.is_approved ? "border-gold/10 bg-card" : "border-amber-500/40 bg-amber-500/5"}`}>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-0.5 text-gold">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${r.rating >= n ? "fill-current" : "opacity-30"}`} />)}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.is_approved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {r.is_approved ? "معتمد" : "بانتظار المراجعة"}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r.comment}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
              <div className="flex gap-2">
                <button onClick={() => moderate(r.id, !r.is_approved)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-bold hover:bg-accent">
                  {r.is_approved ? <><XIcon className="h-3 w-3" /> إخفاء</> : <><Check className="h-3 w-3" /> اعتماد</>}
                </button>
                <ConfirmButton onConfirm={() => del(r.id)}><IconDelete /> حذف</ConfirmButton>
              </div>
            </div>
          </article>
        ))}
        {shown.length === 0 && <div className="col-span-full p-10 text-center text-muted-foreground">لا توجد تقييمات.</div>}
      </div>
    </div>
  );
}

/* =============================== USERS =============================== */
const rolesList = ["admin", "staff", "customer"] as const;

function UsersPanel() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data: users = [] } = useQuery(usersAdminQuery());
  const [search, setSearch] = useState("");

  const filtered = users.filter((u: any) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search) || u.id.includes(search)
  );

  async function toggleRole(userId: string, role: string, has: boolean) {
    if (userId === me?.id && role === "admin" && has) {
      if (!confirm("هل أنت متأكد من إزالة صلاحيتك كأدمن عن نفسك؟ لن تستطيع الرجوع للوحة إلا بإسناد الصلاحية يدوياً.")) return;
    }
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("تم تحديث الصلاحيات");
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  async function delProfile(userId: string) {
    if (userId === me?.id) { toast.error("لا يمكنك حذف حسابك من هنا"); return; }
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف الملف الشخصي (الحساب الأصلي في نظام المصادقة يظل موجوداً)");
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف أو المعرّف..." className="pr-10" />
        </div>
        <Badge variant="outline">{filtered.length} مستخدم</Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gold/10 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs font-bold text-muted-foreground">
              <tr>
                <th className="p-3 text-right">المستخدم</th>
                <th className="p-3 text-right">الهاتف</th>
                <th className="p-3 text-right">تاريخ التسجيل</th>
                <th className="p-3 text-right">الصلاحيات</th>
                <th className="p-3 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-bold">{u.full_name ?? "—"} {u.id === me?.id && <Badge className="mr-1 bg-gold-gradient text-gold-foreground">أنت</Badge>}</div>
                    <div className="font-mono text-[10px] text-muted-foreground break-all">{u.id}</div>
                  </td>
                  <td className="p-3 font-mono text-xs">{u.phone ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">{new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {rolesList.map((r) => {
                        const has = u.roles.includes(r);
                        return (
                          <button key={r} onClick={() => toggleRole(u.id, r, has)}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${has ? (r === "admin" ? "bg-destructive/20 text-destructive" : r === "staff" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400") : "border border-border text-muted-foreground hover:bg-accent"}`}>
                            {has ? "✓ " : "+ "}{r === "admin" ? "أدمن" : r === "staff" ? "موظف" : "عميل"}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <ConfirmButton onConfirm={() => delProfile(u.id)} message="حذف الملف الشخصي؟"><IconDelete /></ConfirmButton>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">لا يوجد مستخدمون.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =============================== SETTINGS =============================== */
function SettingsPanel() {
  const qc = useQueryClient();
  const { data: settings = {} } = useQuery(siteSettingsQuery());
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  function setKey(key: string, field: string, value: string) {
    setDraft((d) => ({ ...d, [key]: { ...(d[key] ?? (settings as any)[key]?.value ?? {}), [field]: value } }));
  }

  async function save(key: string) {
    const value = draft[key] ?? (settings as any)[key]?.value;
    setSaving(key);
    const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحفظ");
    setDraft((d) => { const c = { ...d }; delete c[key]; return c; });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  const groups: { key: string; title: string; fields: { name: string; label: string; type?: string }[] }[] = [
    { key: "contact", title: "معلومات التواصل", fields: [
      { name: "phone", label: "رقم الهاتف" }, { name: "whatsapp", label: "واتساب" },
      { name: "email", label: "البريد الإلكتروني" }, { name: "address", label: "العنوان" },
      { name: "map_url", label: "رابط خرائط جوجل" },
    ]},
    { key: "hero", title: "قسم البداية بالرئيسية", fields: [
      { name: "title", label: "العنوان الرئيسي" }, { name: "subtitle", label: "العنوان الفرعي" },
      { name: "cta", label: "نص زر الحجز" },
    ]},
    { key: "social", title: "حسابات التواصل الاجتماعي", fields: [
      { name: "instagram", label: "إنستغرام" }, { name: "facebook", label: "فيسبوك" },
      { name: "tiktok", label: "تيك توك" }, { name: "youtube", label: "يوتيوب" },
    ]},
    { key: "hours", title: "ساعات العمل", fields: [
      { name: "sat", label: "السبت" }, { name: "sun", label: "الأحد" }, { name: "mon", label: "الإثنين" },
      { name: "tue", label: "الثلاثاء" }, { name: "wed", label: "الأربعاء" }, { name: "thu", label: "الخميس" },
      { name: "fri", label: "الجمعة" },
    ]},
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const current = (draft[g.key] ?? (settings as any)[g.key]?.value ?? {}) as Record<string, string>;
        const isDirty = !!draft[g.key];
        return (
          <section key={g.key} className="rounded-2xl border border-gold/10 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-black">{g.title}</h2>
              {isDirty && <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">تغييرات غير محفوظة</Badge>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{f.label}</label>
                  <Input value={current[f.name] ?? ""} onChange={(e) => setKey(g.key, f.name, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => save(g.key)} disabled={!isDirty || saving === g.key} className="bg-gold-gradient text-gold-foreground hover:brightness-110">
                {saving === g.key ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
