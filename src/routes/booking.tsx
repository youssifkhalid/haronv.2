import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { CalendarDays, Clock, ChevronLeft, User, Phone, Check, Scissors } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { servicesQuery, barbersQuery, type Service, type Barber } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(barbersQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "احجز موعدك — صالون هارون" },
      { name: "description", content: "احجز موعدك في صالون هارون خلال ثوانٍ. اختر الخدمة والحلاق والوقت المناسب." },
    ],
  }),
  component: BookingPage,
});

const TIMES = [
  "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00",
];

function BookingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: barbers } = useSuspenseQuery(barbersQuery());

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string>(search.service ?? "");
  const [barberId, setBarberId] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [takenTimes, setTakenTimes] = useState<string[]>([]);

  const service = useMemo(() => services.find((s: Service) => s.id === serviceId), [serviceId, services]);
  const dayOptions = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(today.getDate() + i);
      return { value: d.toISOString().slice(0, 10), day: d.toLocaleDateString("ar-EG", { weekday: "short" }), num: d.getDate(), month: d.toLocaleDateString("ar-EG", { month: "short" }) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load taken time slots for chosen date/barber
  useEffect(() => {
    if (!date) return;
    let alive = true;
    (async () => {
      let q = supabase.from("bookings").select("booking_time, barber_id").eq("booking_date", date).neq("status", "cancelled");
      if (barberId) q = q.eq("barber_id", barberId);
      const { data } = await q;
      if (!alive) return;
      setTakenTimes((data ?? []).map((r: any) => (r.booking_time as string).slice(0, 5)));
    })();
    return () => { alive = false; };
  }, [date, barberId]);

  async function submit() {
    if (!user) {
      toast.error("سجّل دخولك أولاً لإتمام الحجز");
      navigate({ to: "/auth", search: { redirect: "/booking" } });
      return;
    }
    if (!service || !date || !time || !name.trim() || !phone.trim()) {
      toast.error("رجاءً أكمل كل الحقول");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: service.id,
      barber_id: barberId || null,
      booking_date: date,
      booking_time: time,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      notes: notes.trim() || null,
      price_egp: service.price_egp,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error("تعذّر تأكيد الحجز: " + error.message); return; }
    toast.success("تم حجز موعدك بنجاح! سنتواصل معك للتأكيد.");
    qc.invalidateQueries({ queryKey: ["bookings"] });
    navigate({ to: "/account" });
  }

  const steps = ["الخدمة", "الحلاق", "الموعد", "بياناتك"];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <header className="mb-8 text-center">
          <div className="text-xs font-black tracking-[0.35em] text-gold">الحجز</div>
          <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">احجز موعدك في دقيقة</h1>
        </header>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black transition ${step > i + 1 ? "bg-gold-gradient text-gold-foreground" : step === i + 1 ? "bg-gold-gradient text-gold-foreground shadow-gold" : "bg-surface-elevated text-muted-foreground"}`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-bold ${step >= i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < steps.length - 1 && <div className={`mx-1 h-px w-6 sm:w-10 ${step > i + 1 ? "bg-gold" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-gold/10 bg-card p-5 sm:p-8 shadow-elegant">
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="mb-4 text-lg font-bold">اختر الخدمة</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s: Service) => (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`text-right rounded-2xl border p-4 transition ${serviceId === s.id ? "border-gold bg-gold/10 shadow-gold" : "border-border hover:border-gold/40"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold">{s.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="font-black text-gold-gradient">{s.price_egp} ج.م</div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">{s.duration_minutes} د</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="mb-4 text-lg font-bold">اختر الحلاق (اختياري)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setBarberId("")}
                  className={`text-right rounded-2xl border p-4 transition ${!barberId ? "border-gold bg-gold/10 shadow-gold" : "border-border hover:border-gold/40"}`}
                >
                  <div className="font-bold">أي حلاق متاح</div>
                  <div className="mt-1 text-xs text-muted-foreground">سنختار لك أفضل حلاق متاح في موعدك</div>
                </button>
                {barbers.map((b: Barber) => (
                  <button
                    key={b.id}
                    onClick={() => setBarberId(b.id)}
                    className={`text-right rounded-2xl border p-4 transition ${barberId === b.id ? "border-gold bg-gold/10 shadow-gold" : "border-border hover:border-gold/40"}`}
                  >
                    <div className="text-xs font-bold text-gold">{b.title}</div>
                    <div className="font-bold">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.bio}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="mb-4 text-lg font-bold inline-flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold" /> اختر التاريخ</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dayOptions.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => { setDate(d.value); setTime(""); }}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-center transition min-w-[80px] ${date === d.value ? "border-gold bg-gold/10 shadow-gold" : "border-border hover:border-gold/40"}`}
                  >
                    <div className="text-[11px] text-muted-foreground">{d.day}</div>
                    <div className="text-xl font-black">{d.num}</div>
                    <div className="text-[10px] text-muted-foreground">{d.month}</div>
                  </button>
                ))}
              </div>

              <h2 className="mt-6 mb-3 text-lg font-bold inline-flex items-center gap-2"><Clock className="h-5 w-5 text-gold" /> اختر الوقت</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {TIMES.map((t) => {
                  const isTaken = takenTimes.includes(t);
                  return (
                    <button
                      key={t}
                      disabled={isTaken}
                      onClick={() => setTime(t)}
                      className={`rounded-lg border px-2 py-2 text-sm font-bold transition ${
                        isTaken
                          ? "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through"
                          : time === t
                          ? "border-gold bg-gold-gradient text-gold-foreground shadow-gold"
                          : "border-border hover:border-gold/40"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-up">
              <h2 className="mb-4 text-lg font-bold">بياناتك للتواصل</h2>
              <div className="grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">الاسم</span>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل"
                      className="w-full rounded-xl border border-border bg-input/40 px-10 py-3 text-sm outline-none focus:border-gold" />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">رقم الهاتف</span>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="٠١٠xxxxxxxx" inputMode="tel"
                      className="w-full rounded-xl border border-border bg-input/40 px-10 py-3 text-sm outline-none focus:border-gold" />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">ملاحظات (اختياري)</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="مثلاً: طول القصة، تفضيلات خاصة..."
                    className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-gold" />
                </label>
              </div>

              {/* Summary */}
              <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-5">
                <h3 className="text-sm font-black text-gold mb-3 inline-flex items-center gap-2"><Scissors className="h-4 w-4" /> ملخص الحجز</h3>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">الخدمة</dt><dd className="font-bold">{service?.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">الحلاق</dt><dd className="font-bold">{barbers.find((b: Barber) => b.id === barberId)?.name ?? "أي حلاق متاح"}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">التاريخ</dt><dd className="font-bold">{date}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">الوقت</dt><dd className="font-bold">{time}</dd></div>
                  <div className="mt-2 flex justify-between border-t border-gold/20 pt-3">
                    <dt className="font-bold">الإجمالي</dt>
                    <dd className="font-black text-gold-gradient">{service?.price_egp} ج.م</dd>
                  </div>
                </dl>
              </div>

              {!user && (
                <div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm">
                  ستحتاج لتسجيل الدخول لتأكيد الحجز.{" "}
                  <Link to="/auth" search={{ redirect: "/booking" }} className="font-bold text-gold underline">سجّل دخولك الآن</Link>
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold disabled:opacity-40"
            >
              السابق
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !serviceId) || (step === 3 && (!date || !time))}
                className="inline-flex items-center gap-1 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-black text-gold-foreground shadow-gold disabled:opacity-40"
              >
                التالي <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-1 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-black text-gold-foreground shadow-gold disabled:opacity-60"
              >
                {submitting ? "جارٍ الحجز..." : "تأكيد الحجز"}
              </button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
