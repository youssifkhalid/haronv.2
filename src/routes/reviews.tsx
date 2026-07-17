import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Star, Quote, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth";
import { approvedReviewsQuery, myReviewQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

const reviewSchema = z.object({
  rating: z.number().int().min(1, "اختر تقييماً").max(5),
  comment: z.string().trim().min(10, "التعليق قصير جداً").max(600, "التعليق طويل جداً"),
});

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "آراء العملاء — صالون هارون" },
      { name: "description", content: "اقرأ آراء وتقييمات عملاء صالون هارون، وشارك تجربتك بعد زيارتك." },
      { property: "og:title", content: "آراء عملاء صالون هارون" },
      { property: "og:description", content: "تقييمات حقيقية من عملاء صالون هارون." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery(approvedReviewsQuery());
  const { data: mine } = useQuery(myReviewQuery(user?.id));

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mine) { setRating(mine.rating); setComment(mine.comment); }
  }, [mine]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("سجّل الدخول لإرسال تقييمك"); return; }
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    try {
      if (mine) {
        const { error } = await supabase.from("reviews")
          .update({ rating: parsed.data.rating, comment: parsed.data.comment, is_approved: false })
          .eq("id", mine.id);
        if (error) throw error;
        toast.success("تم تحديث تقييمك، بانتظار الموافقة");
      } else {
        const { error } = await supabase.from("reviews").insert({
          user_id: user.id, rating: parsed.data.rating, comment: parsed.data.comment,
        });
        if (error) throw error;
        toast.success("شكراً على تقييمك! سيظهر بعد المراجعة.");
      }
      qc.invalidateQueries({ queryKey: ["reviews"] });
    } catch (err: any) {
      toast.error(err?.message ?? "تعذّر إرسال التقييم");
    } finally { setSubmitting(false); }
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-black tracking-[0.35em] text-gold">آراء العملاء</div>
          <h1 className="mt-3 font-display text-4xl font-black">ماذا يقول عملاؤنا</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-gold/20 bg-card px-5 py-2">
            <Stars value={Number(avg) || 0} />
            <span className="font-black text-gold">{avg}</span>
            <span className="text-xs text-muted-foreground">{reviews.length} تقييم</span>
          </div>
        </header>

        {/* Form */}
        <div className="mt-10 rounded-3xl border border-gold/10 bg-card p-6 shadow-elegant sm:p-8">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Quote className="h-4 w-4 text-gold" /> شاركنا تجربتك
          </div>
          {!user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link to="/auth" search={{ redirect: "/reviews" }} className="font-bold text-gold hover:underline">سجّل الدخول</Link> لكتابة تقييم.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1,2,3,4,5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    aria-label={`تقييم ${n} نجوم`}
                    className="rounded-md p-1 transition"
                  >
                    <Star className={`h-7 w-7 transition ${(hover || rating) >= n ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={600}
                rows={4}
                placeholder="اكتب تجربتك في الصالون..."
                className="w-full rounded-xl border border-border bg-input/40 p-3 text-sm outline-none focus:border-gold"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> يُنشر بعد المراجعة</span>
                <span>{comment.length}/600</span>
              </div>
              <button disabled={submitting}
                className="rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110 disabled:opacity-60">
                {submitting ? "جارٍ الإرسال..." : mine ? "تحديث تقييمي" : "إرسال التقييم"}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {isLoading && <div className="p-6 text-center text-muted-foreground">جارٍ التحميل...</div>}
          {!isLoading && reviews.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gold/20 p-10 text-center text-muted-foreground">
              كن أول من يترك تقييماً!
            </div>
          )}
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-gold/10 bg-card p-5 shadow-elegant">
              <Stars value={r.rating} />
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.comment}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${value >= n ? "fill-gold text-gold" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}
