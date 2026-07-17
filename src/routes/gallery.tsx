import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { galleryQuery } from "@/lib/queries";
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

const fallback = [
  { image_url: g1, alt_text: "الديكور الداخلي لصالون هارون", title: "الصالون" },
  { image_url: g2, alt_text: "خدمة الحلاقة بموس تقليدي", title: "الحلاقة" },
  { image_url: g3, alt_text: "قصة شعر ولحية احترافية", title: "النتيجة" },
  { image_url: g4, alt_text: "أدوات حلاقة فاخرة", title: "الأدوات" },
];

function GalleryPage() {
  const { data = [] } = useQuery(galleryQuery());
  const items = data.length ? data : fallback;

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
          {items.map((it: any, i: number) => (
            <figure
              key={it.id ?? i}
              className={`group relative overflow-hidden rounded-3xl border border-gold/10 bg-card shadow-elegant ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
            >
              <img
                src={it.image_url}
                alt={it.alt_text ?? it.title ?? ""}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              {(it.title || it.alt_text) && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-4 text-sm font-semibold">
                  {it.title || it.alt_text}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
