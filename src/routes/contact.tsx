import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — صالون هارون" },
      { name: "description", content: "تواصل مع صالون هارون. عنواننا، أرقام الهاتف، ساعات العمل، ونموذج مراسلة مباشر." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم قصير").max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("بريد غير صحيح").max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "الرسالة قصيرة").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setBusy(false);
    if (error) { toast.error("تعذّر الإرسال — حاول مجددًا"); return; }
    toast.success("تم إرسال رسالتك، سنرد قريبًا");
    setForm({ name: "", phone: "", email: "", subject: "", message: "" });
  }

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

        <form onSubmit={submit} className="glass mt-10 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-2xl font-black">أرسل لنا رسالة</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>الاسم *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} /></div>
            <div><Label>الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} inputMode="tel" /></div>
            <div><Label>البريد الإلكتروني</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} /></div>
            <div><Label>الموضوع</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={120} /></div>
          </div>
          <div><Label>الرسالة *</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={5} maxLength={2000} rows={5} /></div>
          <Button type="submit" disabled={busy} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110">
            <Send className="h-4 w-4 ml-1" /> {busy ? "جارٍ الإرسال..." : "إرسال"}
          </Button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-3">
          <a href="#" className="rounded-full border border-gold/30 p-3 text-gold hover:bg-gold/10" aria-label="انستغرام"><Instagram className="h-5 w-5" /></a>
          <a href="#" className="rounded-full border border-gold/30 p-3 text-gold hover:bg-gold/10" aria-label="فيسبوك"><Facebook className="h-5 w-5" /></a>
        </div>
      </div>
    </SiteLayout>
  );
}
