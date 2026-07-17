import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "المعرض — صالون هارون | لقطات من داخل الصالون" },
      { name: "description", content: "استعرض لقطات من صالون هارون: الديكور الفاخر، أعمال الحلاقين، والأدوات الاحترافية." },
      { property: "og:title", content: "معرض صالون هارون" },
      { property: "og:description", content: "لقطات من داخل صالون هارون للحلاقة الرجالية الفاخرة." },
      { property: "og:image", content: g1 },
    ],
  }),
  component: GalleryPage,
});

const items = [
  { src: g1, alt: "الديكور الداخلي لصالون هارون" },
  { src: g2, alt: "خدمة الحلاقة بموس تقليدي" },
  { src: g3, alt: "قصة شعر ولحية احترافية" },
  { src: g4, alt: "أدوات حلاقة فاخرة" },
];

export default function GalleryPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-black tracking-[0.35em] text-gold">المعرض</div>
          <h1 className="mt-3 font-display text-4xl font-black">لقطات من داخل صالون هارون</h1>
          <p className="mt-3 text-muted-foreground">
            تصميم فاخر، أدوات احترافية، ونتائج تتحدث عن نفسها.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <figure
              key={it.src}
              className={`group relative overflow-hidden rounded-3xl border border-gold/10 bg-card shadow-elegant ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
            >
              <img
                src={it.src}
                alt={it.alt}
                width={1200}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-4 text-sm font-semibold">
                {it.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
