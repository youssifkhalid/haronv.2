import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "إعادة تعيين كلمة المرور — صالون هارون" },
      { name: "description", content: "أعد تعيين كلمة مرور حسابك في صالون هارون." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Recovery links land here with a hash like #type=recovery&access_token=...
    // Supabase client parses the hash automatically and fires PASSWORD_RECOVERY.
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("update");
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { toast.error("أدخل بريدك الإلكتروني"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("تم إرسال رابط إعادة التعيين إلى بريدك");
    } catch (err: any) {
      toast.error(err?.message ?? "تعذّر إرسال البريد");
    } finally { setLoading(false); }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("كلمة السر يجب ألا تقل عن ٨ أحرف"); return; }
    if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("تم تحديث كلمة المرور، جارٍ التوجيه...");
      setTimeout(() => navigate({ to: "/account" }), 800);
    } catch (err: any) {
      toast.error(err?.message ?? "تعذّر تحديث كلمة المرور");
    } finally { setLoading(false); }
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <Logo size={60} />
        <div className="mt-8 w-full rounded-3xl border border-gold/10 bg-card p-6 shadow-elegant sm:p-8">
          <h1 className="text-center font-display text-2xl font-black">
            {mode === "update" ? "اختر كلمة مرور جديدة" : "نسيت كلمة المرور؟"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "update"
              ? "أدخل كلمة المرور الجديدة لحسابك."
              : "أدخل بريدك وسنرسل لك رابط إعادة تعيين آمن."}
          </p>

          {mode === "request" ? (
            <form onSubmit={requestReset} className="mt-6 space-y-3">
              <Field icon={<Mail className="h-4 w-4" />} placeholder="البريد الإلكتروني" value={email} onChange={setEmail} type="email" required />
              <button disabled={loading} className="w-full rounded-xl bg-gold-gradient py-3 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110 disabled:opacity-60">
                {loading ? "جارٍ الإرسال..." : "إرسال رابط الإعادة"}
              </button>
            </form>
          ) : (
            <form onSubmit={updatePassword} className="mt-6 space-y-3">
              <Field icon={<Lock className="h-4 w-4" />} placeholder="كلمة المرور الجديدة" value={password} onChange={setPassword} type="password" required />
              <Field icon={<Lock className="h-4 w-4" />} placeholder="تأكيد كلمة المرور" value={confirm} onChange={setConfirm} type="password" required />
              <button disabled={loading} className="w-full rounded-xl bg-gold-gradient py-3 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110 disabled:opacity-60">
                {loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
              </button>
            </form>
          )}
        </div>
        <Link to="/auth" className="mt-6 text-xs text-muted-foreground hover:text-gold">← تسجيل الدخول</Link>
      </div>
    </SiteLayout>
  );
}

function Field({ icon, ...p }: any) {
  return (
    <div className="relative">
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input {...p} onChange={(e) => p.onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-input/40 px-10 py-3 text-sm outline-none focus:border-gold" />
    </div>
  );
}
