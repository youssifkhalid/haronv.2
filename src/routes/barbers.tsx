import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { barbersQuery, type Barber } from "@/lib/queries";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";

const imgs = [b1, b2, b3];

export const Route = createFileRoute("/barbers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(barbersQuery()),
  head: () => ({
    meta: [
      { title: "طاقم الحلاقين — صالون هارون" },
      { name: "description", content: "تعرّف على فريق حلاقي صالون هارون — خبرات وفنون في خدمتك." },
    ],
  }),
  component: BarbersPage,
});

function BarbersPage() {
  const { data: barbers } = useSuspenseQuery(barbersQuery());
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <header className="max-w-2xl">
          <div className="text-xs font-black tracking-[0.35em] text-gold">الطاقم</div>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">فريقنا المحترف</h1>
          <p className="mt-4 text-muted-foreground">حلاقون بخبرات تمتد لعقود، شغفهم إتقان التفاصيل.</p>
        </header>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b: Barber, i) => (
            <div key={b.id} className="group relative overflow-hidden rounded-3xl border border-gold/10 bg-surface animate-fade-up" style={{ animationDelay: `${i*70}ms` }}>
              <div className="aspect-[4/5] overflow-hidden">
                <img src={imgs[i % 3]} alt={b.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-6">
                <div className="text-xs font-bold tracking-widest text-gold">{b.title}</div>
                <div className="flex items-center justify-between">
                  <h3 className="mt-0.5 text-2xl font-black">{b.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
                    <Star className="h-3.5 w-3.5 fill-gold" /> {b.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{b.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
