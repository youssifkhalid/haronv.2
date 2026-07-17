import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Scissors, Sparkles, Wind, Palette, Droplet, Crown, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { servicesQuery, type Service } from "@/lib/queries";

const iconMap: Record<string, any> = { scissors: Scissors, sparkles: Sparkles, wind: Wind, palette: Palette, droplet: Droplet, crown: Crown };

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery()),
  head: () => ({
    meta: [
      { title: "خدماتنا — صالون هارون" },
      { name: "description", content: "قائمة خدمات صالون هارون: قص شعر، تهذيب لحية، حلاقة ملكية، صبغة، علاج فروة الرأس، وباقة العريس." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery());
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <header className="max-w-2xl">
          <div className="text-xs font-black tracking-[0.35em] text-gold">خدماتنا</div>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">قائمة الخدمات والأسعار</h1>
          <p className="mt-4 text-muted-foreground">أسعار شفافة، جودة استثنائية، وخبرة تلمسها من أول زيارة.</p>
        </header>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s: Service, i) => {
            const Icon = iconMap[s.icon ?? ""] ?? Scissors;
            return (
              <div key={s.id} className="animate-fade-up group rounded-2xl border border-gold/10 bg-card p-6 transition hover:border-gold/40 hover:shadow-gold" style={{ animationDelay: `${i*50}ms` }}>
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gold-gradient text-gold-foreground shadow-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{s.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {s.duration_minutes} د</span>
                  <span className="text-lg font-black text-gold-gradient">{s.price_egp} <span className="text-xs font-medium text-muted-foreground">ج.م</span></span>
                </div>
                <Link to="/booking" search={{ service: s.id }} className="mt-4 block rounded-lg border border-gold/40 py-2 text-center text-sm font-bold text-gold hover:bg-gold/10">احجز هذه الخدمة</Link>
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
