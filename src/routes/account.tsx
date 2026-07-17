import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CalendarCheck, Clock, User, Phone, X, Scissors } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth";
import { myBookingsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "حسابي — صالون هارون" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

const statusLabel: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار التأكيد", cls: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  confirmed: { label: "مؤكد", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  completed: { label: "مكتمل", cls: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  cancelled: { label: "ملغي", cls: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  no_show: { label: "لم يحضر", cls: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30" },
};

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  const { data: bookings = [], isLoading } = useQuery(myBookingsQuery(user?.id));

  async function cancel(id: string) {
    if (!confirm("هل أنت متأكد من إلغاء الحجز؟")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم إلغاء الحجز");
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  if (!user) return null;

  const upcoming = bookings.filter((b: any) => b.status !== "cancelled" && b.status !== "completed" && b.booking_date >= new Date().toISOString().slice(0,10));
  const past = bookings.filter((b: any) => !upcoming.includes(b));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[0.35em] text-gold">حسابي</div>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">مرحباً {user.email?.split("@")[0]}</h1>
          </div>
          <Link to="/booking" className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-black text-gold-foreground shadow-gold">
            <CalendarCheck className="h-4 w-4" /> حجز جديد
          </Link>
        </header>

        <section>
          <h2 className="mb-4 text-lg font-bold">مواعيدك القادمة</h2>
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-surface/50 p-6 text-center text-sm text-muted-foreground">جارٍ التحميل...</div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Scissors className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-3 text-sm text-muted-foreground">لا توجد حجوزات قادمة.</p>
              <Link to="/booking" className="mt-4 inline-block rounded-lg bg-gold-gradient px-4 py-2 text-sm font-bold text-gold-foreground">احجز الآن</Link>
            </div>
          ) : (
            <div className="grid gap-3">{upcoming.map((b: any) => <BookingCard key={b.id} b={b} onCancel={cancel} />)}</div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-muted-foreground">السجل السابق</h2>
            <div className="grid gap-3 opacity-70">{past.map((b: any) => <BookingCard key={b.id} b={b} />)}</div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

function BookingCard({ b, onCancel }: { b: any; onCancel?: (id: string) => void }) {
  const s = statusLabel[b.status];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gold/10 bg-card p-4 sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-black">{b.services?.name ?? "خدمة"}</h3>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>{s.label}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {b.booking_date}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {String(b.booking_time).slice(0,5)}</span>
          <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {b.barbers?.name ?? "أي حلاق"}</span>
          <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {b.customer_phone}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-lg font-black text-gold-gradient">{b.price_egp} <span className="text-xs text-muted-foreground">ج.م</span></div>
        {onCancel && b.status !== "cancelled" && b.status !== "completed" && (
          <button onClick={() => onCancel(b.id)} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/10">
            <X className="h-3.5 w-3.5" /> إلغاء
          </button>
        )}
      </div>
    </div>
  );
}
