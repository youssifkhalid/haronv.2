import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { contentPageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/pages/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — صالون هارون` },
    ],
  }),
  component: ContentPage,
});

function ContentPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(contentPageBySlugQuery(slug));

  if (isLoading) return <SiteLayout><div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">جارٍ التحميل...</div></SiteLayout>;
  if (!data) return <SiteLayout><div className="mx-auto max-w-3xl px-4 py-24 text-center">الصفحة غير موجودة.</div></SiteLayout>;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <header className="border-b border-gold/10 pb-6">
          <h1 className="font-display text-4xl font-black">{data.title}</h1>
          {data.seo_description && <p className="mt-3 text-muted-foreground">{data.seo_description}</p>}
        </header>
        <div className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground/90">{data.body}</div>
      </article>
    </SiteLayout>
  );
}
