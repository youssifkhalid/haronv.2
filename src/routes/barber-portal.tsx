import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar, User as UserIcon, Image as ImageIcon, BarChart3, Clock,
  Share2, Loader2, Trash2, ArrowUp, ArrowDown, Play, Save, Sparkles, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth, useRoles } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  barberByUserQuery, barberPortfolioQuery, barberBookingsQuery,
  whatsappHref, socialHref, type BarberFull, type PortfolioItem,
} from "@/lib/queries-barber";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SingleImageUpload, MediaUploadField } from "@/components/site/MediaUploadField";
import { SocialLinks, WhatsAppIcon, TikTokIcon } from "@/components/site/SocialIcons";
import { Instagram, Facebook } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/barber-portal")({
  head: () => ({ meta: [
    { title: "بوابة الحلاق — صالون هارون" },
    { name: "robots", content: "noindex" },
  ]}),
  component: BarberPortal,
});

const DAYS = [
  { key: "sat", label: "السبت" }, { key: "sun", label: "الأحد" }, { key: "mon", label: "الاثنين" },
  { key: "tue", label: "الثلاثاء" }, { key: "wed", label: "الأربعاء" }, { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
];

function BarberPortal() {
  const { user, loading } = useAuth();
  const { roles, isAdmin, loading: rolesLoading } = useRoles(user?.id);
  const navigate = useNavigate();
  const isBarber = roles.includes("barber" as any) || isAdmin;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/barber-portal" } });
  }, [loading, user, navigate]);

  const { data: barber, isLoading: barberLoading, refetch } = useQuery(barberByUserQuery(user?.id));

  if (loading || rolesLoading || barberLoading) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">جارٍ التحميل...</div>;
  }
  if (!user) return null;

  if (!isBarber) {
    return <Blocked title="ممنوع الوصول" msg="هذه البوابة مخصصة لطاقم الحلاقين فقط." />;
  }
  if (!barber) {
    return <Blocked title="حسابك مش مربوط بملف حلاق"
      msg="تواصل مع إدارة الصالون لربط حسابك بملفك الشخصي كي تدير مواعيدك ومعرض أعمالك." />;
  }

  return <PortalUI barber={barber} onRefresh={refetch} />;
}

function Blocked({ title, msg }: { title: string; msg: string }) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold/10 text-gold">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{msg}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-gold hover:underline">← العودة للرئيسية</Link>
      </div>
    </SiteLayout>
  );
}

function PortalUI({ barber, onRefresh }: { barber: BarberFull; onRefresh: () => void }) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-gold/15 bg-surface-elevated">
          <div className="h-32 sm:h-40 w-full bg-gold-gradient/40" style={barber.cover_url ? { backgroundImage: `url(${barber.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 px-6 pb-6 relative">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-surface-elevated bg-gold-gradient grid place-items-center text-3xl font-black text-gold-foreground shadow-gold">
              {barber.photo_url ? <img src={barber.photo_url} alt={barber.name} className="h-full w-full object-cover" /> : barber.name.charAt(0)}
            </div>
            <div className="flex-1 pt-2">
              <div className="text-xs font-bold text-gold tracking-widest">بوابة الحلاق</div>
              <h1 className="mt-1 font-display text-3xl font-black">{barber.name}</h1>
              <div className="text-sm text-muted-foreground">{barber.title ?? "—"}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/barbers/$barberId" params={{ barberId: barber.id }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-2 text-sm font-bold text-gold hover:bg-gold/10">
                <Share2 className="h-4 w-4" /> عرض ملفي العام
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-auto p-1">
            <TabsTrigger value="profile" className="gap-1.5"><UserIcon className="h-4 w-4" /><span className="hidden sm:inline">الملف</span></TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5"><Instagram className="h-4 w-4" /><span className="hidden sm:inline">التواصل</span></TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-1.5"><ImageIcon className="h-4 w-4" /><span className="hidden sm:inline">أعمالي</span></TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">مواعيدي</span></TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">إحصائياتي</span></TabsTrigger>
            <TabsTrigger value="hours" className="gap-1.5"><Clock className="h-4 w-4" /><span className="hidden sm:inline">مواعيد العمل</span></TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6"><ProfileTab barber={barber} onSaved={onRefresh} /></TabsContent>
          <TabsContent value="social" className="mt-6"><SocialTab barber={barber} onSaved={onRefresh} /></TabsContent>
          <TabsContent value="portfolio" className="mt-6"><PortfolioTab barber={barber} /></TabsContent>
          <TabsContent value="bookings" className="mt-6"><BookingsTab barber={barber} /></TabsContent>
          <TabsContent value="stats" className="mt-6"><StatsTab barber={barber} /></TabsContent>
          <TabsContent value="hours" className="mt-6"><HoursTab barber={barber} onSaved={onRefresh} /></TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

/* ==================== PROFILE TAB ==================== */
const MAX_BIO = 500;
function ProfileTab({ barber, onSaved }: { barber: BarberFull; onSaved: () => void }) {
  const [photo, setPhoto] = useState(barber.photo_url ?? "");
  const [cover, setCover] = useState(barber.cover_url ?? "");
  const [title, setTitle] = useState(barber.title ?? "");
  const [bio, setBio] = useState(barber.bio ?? "");
  const [chair, setChair] = useState<string>(barber.chair_number != null ? String(barber.chair_number) : "");
  const [present, setPresent] = useState(barber.is_present_now);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const chairNum = chair.trim() ? Math.max(1, Math.min(99, parseInt(chair, 10) || 0)) : null;
    const { error } = await supabase.from("barbers").update({
      photo_url: photo || null,
      cover_url: cover || null,
      title: title.trim() || null,
      bio: bio.slice(0, MAX_BIO) || null,
      chair_number: chairNum,
      is_present_now: present,
    }).eq("id", barber.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ الملف الشخصي");
    onSaved();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5 rounded-2xl border border-gold/10 bg-card p-5">
        <div>
          <Label className="mb-2 block">صورة الغلاف</Label>
          <SingleImageUpload value={cover} onChange={setCover} aspect="aspect-[3/1]" label="ارفع صورة غلاف واسعة" />
        </div>
        <div>
          <Label className="mb-2 block">الصورة الشخصية</Label>
          <div className="max-w-[200px]">
            <SingleImageUpload value={photo} onChange={setPhoto} aspect="aspect-square" label="ارفع صورتك" />
          </div>
        </div>
        <div>
          <Label>الاسم</Label>
          <Input value={barber.name} readOnly disabled className="mt-1 bg-muted/30" />
          <p className="mt-1 text-xs text-muted-foreground">الاسم يُعدَّل من قِبَل الإدارة فقط.</p>
        </div>
        <div>
          <Label>المسمى الوظيفي / التخصص</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="حلاق أول — تخصص لحية كلاسيك" className="mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>نبذة تعريفية</Label>
            <span className={`text-xs ${bio.length > MAX_BIO ? "text-destructive" : "text-muted-foreground"}`}>{bio.length}/{MAX_BIO}</span>
          </div>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))} rows={4} placeholder="اكتب نبذة قصيرة عنك، خبرتك، وتخصصك..." className="mt-1" />
        </div>
        <Button onClick={save} disabled={saving} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ الملف
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gold/10 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">متواجد الآن في الصالون</div>
              <div className="text-xs text-muted-foreground">يظهر مباشرة للعملاء على صفحتك</div>
            </div>
            <Switch checked={present} onCheckedChange={async (v) => {
              setPresent(v);
              const { error } = await supabase.from("barbers").update({ is_present_now: v }).eq("id", barber.id);
              if (error) { toast.error(error.message); setPresent(!v); return; }
              toast.success(v ? "أنت متواجد الآن ✅" : "تم إيقاف التواجد");
            }} />
          </div>
        </div>
        <div className="rounded-2xl border border-gold/10 bg-gold/5 p-5 text-sm">
          <div className="flex items-center gap-2 font-bold text-gold"><Sparkles className="h-4 w-4" /> نصيحة</div>
          <p className="mt-2 text-muted-foreground text-xs leading-relaxed">صورة واضحة ونبذة قصيرة تجذب ضعف الحجوزات. لا تنسَ تحديث "متواجد الآن" عند وصولك.</p>
        </div>
      </div>
    </div>
  );
}

/* ==================== SOCIAL TAB ==================== */
const phoneRe = /^[\d+\s\-()]{7,20}$/;
const urlRe = /^https?:\/\/.+/i;
function SocialTab({ barber, onSaved }: { barber: BarberFull; onSaved: () => void }) {
  const [wa, setWa] = useState(barber.whatsapp ?? "");
  const [ig, setIg] = useState(barber.instagram ?? "");
  const [tt, setTt] = useState(barber.tiktok ?? "");
  const [fb, setFb] = useState(barber.facebook ?? "");
  const [saving, setSaving] = useState(false);

  const errors = {
    wa: wa && !phoneRe.test(wa) ? "رقم غير صحيح" : "",
    ig: ig && !urlRe.test(ig) && !/^@?[\w.]+$/.test(ig) ? "أدخل الرابط أو @username" : "",
    tt: tt && !urlRe.test(tt) && !/^@?[\w.]+$/.test(tt) ? "أدخل الرابط أو @username" : "",
    fb: fb && !urlRe.test(fb) && !/^[\w.]+$/.test(fb) ? "أدخل الرابط الكامل" : "",
  };
  const hasError = Object.values(errors).some(Boolean);

  async function save() {
    if (hasError) { toast.error("تحقق من الحقول"); return; }
    setSaving(true);
    const { error } = await supabase.from("barbers").update({
      whatsapp: wa.trim() || null,
      instagram: ig.trim() || null,
      tiktok: tt.trim() || null,
      facebook: fb.trim() || null,
    }).eq("id", barber.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ روابط التواصل");
    onSaved();
  }

  const fields = [
    { key: "wa", val: wa, set: setWa, icon: <WhatsAppIcon />, label: "واتساب", placeholder: "01012345678", err: errors.wa },
    { key: "ig", val: ig, set: setIg, icon: <Instagram className="h-5 w-5" />, label: "انستجرام", placeholder: "@username أو رابط كامل", err: errors.ig },
    { key: "tt", val: tt, set: setTt, icon: <TikTokIcon />, label: "تيك توك", placeholder: "@username أو رابط كامل", err: errors.tt },
    { key: "fb", val: fb, set: setFb, icon: <Facebook className="h-5 w-5" />, label: "فيسبوك", placeholder: "username أو رابط كامل", err: errors.fb },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4 rounded-2xl border border-gold/10 bg-card p-5">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="flex items-center gap-2 mb-1"><span className="text-gold">{f.icon}</span> {f.label}</Label>
            <Input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} dir="ltr" className={f.err ? "border-destructive" : ""} />
            {f.err && <div className="mt-1 text-xs text-destructive">{f.err}</div>}
          </div>
        ))}
        <Button onClick={save} disabled={saving || hasError} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
        </Button>
      </div>
      <div className="rounded-2xl border border-gold/10 bg-card p-5">
        <div className="text-sm font-bold mb-3">معاينة كما يراها العميل</div>
        <SocialLinks whatsapp={wa} instagram={ig} tiktok={tt} facebook={fb} size="lg" />
        {[wa, ig, tt, fb].every((v) => !v.trim()) && (
          <div className="text-xs text-muted-foreground">لم تضف أي وسيلة تواصل بعد.</div>
        )}
      </div>
    </div>
  );
}

/* ==================== PORTFOLIO TAB ==================== */
function PortfolioTab({ barber }: { barber: BarberFull }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(barberPortfolioQuery(barber.id));
  const [caption, setCaption] = useState("");
  const [pendingUrl, setPendingUrl] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveNewItem(media: { url: string; type: "image" | "video" }) {
    setPendingUrl(media);
  }
  async function commit() {
    if (!pendingUrl) return;
    setSaving(true);
    const nextOrder = (items[items.length - 1]?.sort_order ?? -1) + 1;
    const { error } = await supabase.from("barber_portfolio_items").insert({
      barber_id: barber.id,
      media_type: pendingUrl.type,
      media_url: pendingUrl.url,
      caption: caption.trim() || null,
      sort_order: nextOrder,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت الإضافة لمعرض أعمالك");
    setCaption(""); setPendingUrl(null);
    qc.invalidateQueries({ queryKey: ["barber-portfolio", barber.id] });
  }

  async function del(id: string) {
    if (!confirm("حذف هذا العنصر من المعرض؟")) return;
    const { error } = await supabase.from("barber_portfolio_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["barber-portfolio", barber.id] });
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[idx], b = items[j];
    const [oa, ob] = [a.sort_order, b.sort_order];
    // ensure different values
    const newA = ob, newB = oa === ob ? oa + dir : oa;
    await Promise.all([
      supabase.from("barber_portfolio_items").update({ sort_order: newA }).eq("id", a.id),
      supabase.from("barber_portfolio_items").update({ sort_order: newB }).eq("id", b.id),
    ]);
    qc.invalidateQueries({ queryKey: ["barber-portfolio", barber.id] });
  }

  async function updateCaption(id: string, cap: string) {
    await supabase.from("barber_portfolio_items").update({ caption: cap.trim() || null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["barber-portfolio", barber.id] });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold/10 bg-card p-5">
        <div className="text-sm font-bold mb-3">إضافة عمل جديد (صورة أو فيديو ريلز)</div>
        {!pendingUrl ? (
          <MediaUploadField onUploaded={saveNewItem} aspect="aspect-video" label="اختر صورة أو فيديو من جهازك" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <div className="rounded-xl overflow-hidden border border-gold/20 aspect-square">
              {pendingUrl.type === "video"
                ? <video src={pendingUrl.url} className="h-full w-full object-cover" muted playsInline />
                : <img src={pendingUrl.url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="space-y-2">
              <Label>وصف/كابشن (اختياري)</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 140))} rows={3} placeholder="مثال: قصة فيد عصرية بتشكيل لحية" />
              <div className="flex gap-2">
                <Button onClick={commit} disabled={saving} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة للمعرض"}
                </Button>
                <Button variant="outline" onClick={() => { setPendingUrl(null); setCaption(""); }}>إلغاء</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gold/20 bg-gold/5 p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gold/60" />
          <h3 className="mt-4 font-display text-xl font-black">ابدأ ببناء معرض أعمالك الأول!</h3>
          <p className="mt-2 text-sm text-muted-foreground">ارفع أول صورة أو فيديو الآن — كل عمل بيقربك من عميل جديد.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => <PortfolioCard key={it.id} item={it} idx={idx} total={items.length}
            onDelete={() => del(it.id)} onMove={(d) => move(idx, d)} onCaption={(c) => updateCaption(it.id, c)} />)}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ item, idx, total, onDelete, onMove, onCaption }: {
  item: PortfolioItem; idx: number; total: number;
  onDelete: () => void; onMove: (d: -1 | 1) => void; onCaption: (c: string) => void;
}) {
  const [cap, setCap] = useState(item.caption ?? "");
  const [editing, setEditing] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-gold/10 bg-card group">
      <div className="relative aspect-square bg-black">
        {item.media_type === "video" ? (
          <>
            <video src={item.media_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            <div className="absolute inset-0 grid place-items-center bg-black/30 pointer-events-none">
              <Play className="h-10 w-10 text-white fill-white/80" />
            </div>
          </>
        ) : (
          <img src={item.media_url} alt={item.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
        )}
        <Badge className="absolute top-2 right-2 bg-black/70 backdrop-blur border-0">{item.media_type === "video" ? "فيديو" : "صورة"}</Badge>
      </div>
      <div className="p-3 space-y-2">
        {editing ? (
          <>
            <Textarea value={cap} onChange={(e) => setCap(e.target.value.slice(0, 140))} rows={2} className="text-xs" />
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => { onCaption(cap); setEditing(false); }}>حفظ</Button>
              <Button size="sm" variant="outline" onClick={() => { setCap(item.caption ?? ""); setEditing(false); }}>إلغاء</Button>
            </div>
          </>
        ) : (
          <button className="text-xs text-muted-foreground w-full text-right hover:text-foreground" onClick={() => setEditing(true)}>
            {item.caption || <span className="italic">+ أضف وصفًا</span>}
          </button>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex gap-1">
            <button onClick={() => onMove(-1)} disabled={idx === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-30" aria-label="لأعلى"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button onClick={() => onMove(1)} disabled={idx === total - 1} className="rounded p-1.5 hover:bg-accent disabled:opacity-30" aria-label="لأسفل"><ArrowDown className="h-3.5 w-3.5" /></button>
          </div>
          <button onClick={onDelete} className="rounded p-1.5 text-destructive hover:bg-destructive/10" aria-label="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

/* ==================== BOOKINGS TAB ==================== */
function BookingsTab({ barber }: { barber: BarberFull }) {
  const qc = useQueryClient();
  const { data: bookings = [] } = useQuery(barberBookingsQuery(barber.id));
  const [filter, setFilter] = useState<"today" | "week" | "upcoming" | "all">("today");

  useEffect(() => {
    const channel = supabase
      .channel(`barber-bookings-${barber.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `barber_id=eq.${barber.id}` },
        () => qc.invalidateQueries({ queryKey: ["barber-bookings", barber.id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [barber.id, qc]);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now.getTime() + 7 * 86400_000).toISOString().slice(0, 10);

  const filtered = bookings.filter((b: any) => {
    if (filter === "today") return b.booking_date === todayStr;
    if (filter === "week") return b.booking_date >= todayStr && b.booking_date <= weekEnd;
    if (filter === "upcoming") return b.booking_date >= todayStr;
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    completed: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    no_show: "bg-muted text-muted-foreground border-border",
  };
  const statusAr: Record<string, string> = {
    pending: "قيد المراجعة", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي", no_show: "لم يحضر",
  };

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="today">اليوم</TabsTrigger>
          <TabsTrigger value="week">هذا الأسبوع</TabsTrigger>
          <TabsTrigger value="upcoming">القادم</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>
      </Tabs>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">لا توجد حجوزات في هذا النطاق.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b: any) => (
            <div key={b.id} className="rounded-2xl border border-gold/10 bg-card p-4 flex flex-wrap items-center gap-4">
              <div className="text-center min-w-[70px] rounded-xl bg-gold/10 py-2 px-3">
                <div className="text-xs text-muted-foreground">{b.booking_date}</div>
                <div className="font-black text-gold" dir="ltr">{b.booking_time?.slice(0, 5)}</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{b.customer_name}</div>
                <div className="text-xs text-muted-foreground">{b.services?.name ?? "—"} • {b.customer_phone}</div>
                {b.notes && <div className="mt-1 text-xs text-muted-foreground italic">"{b.notes}"</div>}
              </div>
              <Badge className={`border ${statusColors[b.status] ?? ""}`} variant="outline">{statusAr[b.status] ?? b.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== STATS TAB ==================== */
function StatsTab({ barber }: { barber: BarberFull }) {
  const { data: bookings = [] } = useQuery(barberBookingsQuery(barber.id));

  const monthKey = new Date().toISOString().slice(0, 7);
  const stats = useMemo(() => {
    const total = bookings.length;
    const month = bookings.filter((b: any) => b.booking_date?.startsWith(monthKey)).length;
    const svcCount: Record<string, number> = {};
    for (const b of bookings) {
      const n = b.services?.name ?? "غير محدد";
      svcCount[n] = (svcCount[n] ?? 0) + 1;
    }
    const topSvc = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    // last 30 days chart
    const days: { day: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      days.push({ day: d.slice(5), count: bookings.filter((b: any) => b.booking_date === d).length });
    }
    return { total, month, topSvc, days };
  }, [bookings, monthKey]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="إجمالي الحجوزات" value={stats.total} />
        <Kpi label="حجوزات هذا الشهر" value={stats.month} />
        <Kpi label="الخدمة الأكثر طلبًا" value={stats.topSvc} textual />
      </div>
      <div className="rounded-2xl border border-gold/10 bg-card p-5">
        <div className="text-sm font-bold mb-3">حجوزاتي — آخر 30 يومًا</div>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={stats.days}>
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--gold)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--gold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
function Kpi({ label, value, textual }: { label: string; value: any; textual?: boolean }) {
  return (
    <div className="rounded-2xl border border-gold/10 bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display font-black ${textual ? "text-xl" : "text-3xl text-gold"}`}>{value}</div>
    </div>
  );
}

/* ==================== HOURS TAB ==================== */
const hoursSchema = z.record(z.string(), z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$|^$/));
function HoursTab({ barber, onSaved }: { barber: BarberFull; onSaved: () => void }) {
  const initial = barber.working_hours ?? {};
  const [hrs, setHrs] = useState<Record<string, string>>(Object.fromEntries(DAYS.map((d) => [d.key, initial[d.key] ?? ""])));
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = hoursSchema.safeParse(hrs);
    if (!parsed.success) { toast.error("صيغة غير صحيحة — استخدم HH:MM-HH:MM"); return; }
    setSaving(true);
    const clean = Object.fromEntries(Object.entries(hrs).filter(([, v]) => v.trim()));
    const { error } = await supabase.from("barbers").update({ working_hours: Object.keys(clean).length ? clean : null }).eq("id", barber.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ ساعات عملك");
    onSaved();
  }

  return (
    <div className="rounded-2xl border border-gold/10 bg-card p-5 max-w-2xl space-y-3">
      <div className="text-sm text-muted-foreground">اترك اليوم فارغًا للإجازة. الصيغة: <code className="bg-muted px-1.5 py-0.5 rounded" dir="ltr">HH:MM-HH:MM</code> — ضمن ساعات عمل الصالون العامة.</div>
      {DAYS.map((d) => (
        <div key={d.key} className="grid grid-cols-[100px_1fr] items-center gap-3">
          <Label>{d.label}</Label>
          <Input value={hrs[d.key]} onChange={(e) => setHrs({ ...hrs, [d.key]: e.target.value })} dir="ltr" placeholder="11:00-23:00" />
        </div>
      ))}
      <Button onClick={save} disabled={saving} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110 mt-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
      </Button>
    </div>
  );
}
