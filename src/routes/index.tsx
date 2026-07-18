import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Scissors, Sparkles, Wind, Palette, Droplet, Crown, Star, Clock, ShieldCheck, Award, CalendarCheck, ChevronLeft, Armchair, Images } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { servicesQuery, barbersQuery, type Service, type Barber } from "@/lib/queries";
import { SocialLinks } from "@/components/site/SocialIcons";
import heroImg from "@/assets/hero-barbershop.jpg";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";

const iconMap: Record<string, any> = { scissors: Scissors, sparkles: Sparkles, wind: Wind, palette: Palette, droplet: Droplet, crown: Crown };
const barberImgs = [barber1, barber2, barber3];

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(barbersQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "صالون هارون — HAROUN | حلاقة رجالية فاخرة في القاهرة" },
      { name: "description", content: "احجز موعدك في صالون هارون. تجربة حلاقة راقية بأيدي محترفين — قص، تهذيب لحية، حلاقة ملكية، وباقات العرسان." },
    ],
  }),
  component: LandingPage,
});

const testimonials = [
  { name: "محمود أحمد", text: "أفضل صالون في المنطقة، خدمة راقية وأسعار مناسبة. أنصح به بشدة.", rating: 5 },
  { name: "كريم حسن", text: "الأستاذ هارون فنان حقيقي، شعري لم يكن أجمل من كده أبداً!", rating: 5 },
  { name: "أحمد سامي", text: "المكان نظيف والطاقم محترم جداً، تجربة تستحق التكرار.", rating: 5 },
  { name: "يوسف علي", text: "حجزت من الموقع بكل سهولة، والتزموا بالمعاد بدقة. تحفة!", rating: 5 },
];

function LandingPage() {
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: barbers } = useSuspenseQuery(barbersQuery());

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-35" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-24 lg:pb-32">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold text-gold">
              <Sparkles className="h-3.5 w-3.5" /> أفخم صالون حلاقة رجالي في القاهرة
            </div>
            <h1 className="font-display text-4xl font-black leading-[1.1] sm:text-6xl lg:text-7xl">
              <span className="block">تجربة حلاقة</span>
              <span className="block text-gold-gradient">تليق بالملوك</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              في <b className="text-foreground">صالون هارون</b> نمزج بين فنون الحلاقة الكلاسيكية والذوق العصري. احجز موعدك أونلاين خلال ثوانٍ، واستمتع بخدمة راقية بأيدي أمهر الحلاقين.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/booking" className="group inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3.5 text-sm font-black text-gold-foreground shadow-gold transition hover:brightness-110">
                <CalendarCheck className="h-5 w-5" />
                احجز موعدك الآن
                <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3.5 text-sm font-bold hover:bg-accent/40">
                استعرض الخدمات
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-gold/10 pt-8 max-w-lg">
              {[
                { k: "+٢٠", v: "سنة خبرة" },
                { k: "+١٥K", v: "عميل سعيد" },
                { k: "٤.٩★", v: "تقييم العملاء" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-2xl font-black text-gold-gradient sm:text-3xl">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block animate-float">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-gold/20 shadow-elegant">
              <img src={heroImg} alt="صالون هارون" className="h-full w-full object-cover" width={1200} height={1500} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 space-x-reverse">
                    {barberImgs.map((b, i) => (
                      <img key={i} src={b} className="h-9 w-9 rounded-full border-2 border-background object-cover" alt="" />
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1 font-bold">
                      {[...Array(5)].map((_,i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                      <span className="mr-1">٤.٩/٥</span>
                    </div>
                    <p className="text-muted-foreground">من أكثر من ١٥٠٠ تقييم</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Award, t: "خبرة ٢٠+ سنة", d: "طاقم محترف بأعلى مستوى" },
            { icon: ShieldCheck, t: "أعلى معايير النظافة", d: "أدوات معقمة ومنطقة عمل نظيفة" },
            { icon: Clock, t: "الحجز أونلاين", d: "احجز موعدك في ثوانٍ بدون انتظار" },
          ].map((p) => (
            <div key={p.t} className="glass flex items-start gap-4 rounded-2xl p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                <p.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="خدماتنا" title="خدمات مصممة لكل ذوق" subtitle="من القصة الكلاسيكية إلى باقات العرسان — كل ما تحتاجه في مكان واحد." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s: Service, i) => {
            const Icon = iconMap[s.icon ?? ""] ?? Scissors;
            return (
              <div key={s.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up group relative overflow-hidden rounded-2xl border border-gold/10 bg-card p-6 transition hover:border-gold/40 hover:shadow-gold">
                <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gold/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gold-gradient text-gold-foreground shadow-gold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.duration_minutes} دقيقة
                    </div>
                    <div className="text-lg font-black text-gold-gradient">{s.price_egp} <span className="text-xs font-medium text-muted-foreground">ج.م</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link to="/booking" className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110">
            احجز الخدمة المناسبة لك <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* BARBERS — LIVE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="حلاقونا الآن"
          title="حلاقون متاحون لحجزك اليوم"
          subtitle="تعرّف على فريقنا، شاهد أعمالهم، واحجز مع الحلاق الأنسب لك."
        />
        <BarbersLive barbers={barbers} />
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="آراء العملاء" title="ماذا يقولون عنا" subtitle="ثقة تُكتسب بالتجربة." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="glass animate-fade-up rounded-2xl p-6" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="mb-3 flex items-center gap-0.5">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm leading-7 text-foreground/90">"{t.text}"</p>
              <footer className="mt-4 text-xs font-bold text-gold">— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-surface-elevated p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 bg-hero opacity-70" />
          <h2 className="font-display text-3xl font-black sm:text-5xl">
            جاهز لتجربة <span className="text-gold-gradient">لا تُنسى؟</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            احجز موعدك الآن وانضم لآلاف العملاء الذين يثقون بصالون هارون.
          </p>
          <Link to="/booking" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-8 py-4 text-base font-black text-gold-foreground shadow-gold hover:brightness-110">
            <CalendarCheck className="h-5 w-5" /> احجز موعدك الآن
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-black tracking-[0.35em] text-gold">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl md:text-5xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BarbersLive({ barbers }: { barbers: Barber[] }) {
  const present = barbers.filter((b) => b.is_present_now);
  const others = barbers.filter((b) => !b.is_present_now);
  const list = present.length > 0 ? present : others;
  const showBoth = present.length > 0 && others.length > 0;

  if (barbers.length === 0) {
    return <p className="mt-12 text-center text-muted-foreground">لا يوجد حلاقون معروضون حالياً.</p>;
  }

  return (
    <>
      {present.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {present.length} حلاق متواجد الآن في الصالون
        </div>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b, i) => (
          <BarberLiveCard key={b.id} b={b} i={i} />
        ))}
      </div>
      {showBoth && (
        <>
          <div className="mt-14 text-center text-xs font-black tracking-[0.35em] text-gold/70">— باقي الفريق —</div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((b, i) => <BarberLiveCard key={b.id} b={b} i={i} />)}
          </div>
        </>
      )}
      <div className="mt-10 text-center">
        <Link to="/barbers" className="inline-flex items-center gap-2 rounded-xl border border-gold/40 px-6 py-3 text-sm font-bold text-gold hover:bg-gold/10">
          كل الحلاقين <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

function BarberLiveCard({ b, i }: { b: Barber; i: number }) {
  const cover = b.cover_url || barberImgs[i % 3];
  return (
    <article
      className="group animate-fade-up relative flex flex-col overflow-hidden rounded-3xl border border-gold/10 bg-surface transition hover:border-gold/40 hover:shadow-elegant"
      style={{ animationDelay: `${i * 70}ms` }}
    >
      {/* Cover */}
      <div className="relative h-32 overflow-hidden">
        <img src={cover} alt="" className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        {b.is_present_now && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            متواجد الآن
          </div>
        )}
        {b.chair_number != null && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-gold border border-gold/30">
            <Armchair className="h-3.5 w-3.5" /> كرسي {b.chair_number}
          </div>
        )}
      </div>

      <div className="relative -mt-14 px-5 pb-5">
        {/* Avatar */}
        <div className="mx-auto h-24 w-24 rounded-2xl overflow-hidden border-4 border-surface bg-gold-gradient grid place-items-center text-3xl font-black text-gold-foreground shadow-gold">
          {b.photo_url
            ? <img src={b.photo_url} alt={b.name} className="h-full w-full object-cover" loading="lazy" />
            : b.name.charAt(0)}
        </div>

        <div className="mt-3 text-center">
          <div className="text-[11px] font-bold tracking-widest text-gold">{b.title ?? "حلاق"}</div>
          <h3 className="mt-1 text-xl font-black">{b.name}</h3>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            <Star className="h-3 w-3 fill-gold" /> {Number(b.rating ?? 5).toFixed(1)}
          </div>
        </div>

        {b.bio && (
          <p className="mt-3 text-center text-sm text-muted-foreground line-clamp-2 leading-6">{b.bio}</p>
        )}

        {/* Socials */}
        <div className="mt-4 flex justify-center">
          <SocialLinks whatsapp={b.whatsapp ?? null} instagram={b.instagram ?? null} tiktok={b.tiktok ?? null} facebook={b.facebook ?? null} size="sm" />
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/booking"
            search={{ barber: b.id } as any}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-gradient px-3 py-2.5 text-xs font-black text-gold-foreground shadow-gold transition hover:brightness-110"
          >
            <CalendarCheck className="h-4 w-4" /> احجز
          </Link>
          <Link
            to="/barbers/$barberId"
            params={{ barberId: b.id }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gold/40 px-3 py-2.5 text-xs font-black text-gold hover:bg-gold/10"
          >
            <Images className="h-4 w-4" /> أعمالي
          </Link>
        </div>
      </div>
    </article>
  );
}
