import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Mail, Instagram, Facebook } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — صالون هارون" },
      { name: "description", content: "تواصل مع صالون هارون. عنواننا وأرقام الهاتف وساعات العمل." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <header className="text-center">
          <div className="text-xs font-black tracking-[0.35em] text-gold">تواصل معنا</div>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">نحن هنا لخدمتك</h1>
          <p className="mt-4 text-muted-foreground">للاستفسارات، الحجز الجماعي، أو أي مساعدة.</p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Phone, title: "هاتف", value: "٠١٠٠٠٠٠٠٠٠٠", href: "tel:+201000000000" },
            { icon: Mail, title: "بريد", value: "info@haroun-salon.eg", href: "mailto:info@haroun-salon.eg" },
            { icon: MapPin, title: "العنوان", value: "القاهرة، مصر" },
            { icon: Clock, title: "ساعات العمل", value: "يومياً من ١٠ ص إلى ١٢ منتصف الليل" },
          ].map((c) => (
            <a key={c.title} href={c.href ?? "#"} className="glass group flex items-start gap-4 rounded-2xl p-5 transition hover:border-gold/40 hover:shadow-gold">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-gradient text-gold-foreground shadow-gold">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black tracking-widest text-gold">{c.title}</div>
                <div className="mt-1 font-bold">{c.value}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <a href="#" className="rounded-full border border-gold/30 p-3 text-gold hover:bg-gold/10" aria-label="انستغرام"><Instagram className="h-5 w-5" /></a>
          <a href="#" className="rounded-full border border-gold/30 p-3 text-gold hover:bg-gold/10" aria-label="فيسبوك"><Facebook className="h-5 w-5" /></a>
        </div>
      </div>
    </SiteLayout>
  );
}
