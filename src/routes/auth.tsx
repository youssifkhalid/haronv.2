import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — صالون هارون" },
      { name: "description", content: "سجّل الدخول أو أنشئ حساباً لإدارة حجوزاتك في صالون هارون." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (redirect as any) || "/account" });
    });
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error("أدخل البريد وكلمة المرور"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) { toast.error("كلمة السر يجب ألا تقل عن ٨ أحرف"); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name.trim() || null, phone: phone.trim() || null },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء حسابك بنجاح!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("أهلاً بعودتك!");
      }
      navigate({ to: (redirect as any) || "/account" });
    } catch (err: any) {
      const msg = err?.message ?? "حدث خطأ";
      if (msg.toLowerCase().includes("invalid login")) toast.error("البريد أو كلمة السر غير صحيحة");
      else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) toast.error("هذا البريد مسجّل بالفعل، سجّل الدخول");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${redirect || "/account"}` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <Logo size={60} />
        <div className="mt-8 w-full rounded-3xl border border-gold/10 bg-card p-6 shadow-elegant sm:p-8">
          <div className="flex rounded-xl border border-border p-1 text-sm font-bold">
            <button onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2 transition ${mode === "login" ? "bg-gold-gradient text-gold-foreground" : "text-muted-foreground"}`}>تسجيل الدخول</button>
            <button onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2 transition ${mode === "signup" ? "bg-gold-gradient text-gold-foreground" : "text-muted-foreground"}`}>حساب جديد</button>
          </div>

          <button onClick={google} type="button" className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm font-bold hover:bg-accent/40">
            <svg viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.2 7.9 3l5.7-5.7C34 5 29.3 3 24 3 12 3 3 12 3 23s9 20 21 20c11 0 20-8 20-20 0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.4 19 12 24 12c3 0 5.8 1.2 7.9 3l5.7-5.7C34 5 29.3 3 24 3 16 3 9 7.6 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 33.8 26.8 35 24 35c-5.4 0-9.9-3-11.3-7l-6.5 5C9 40.4 16 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.7 5l6.3 5.2C41.5 34.6 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            المتابعة بحساب Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> أو <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field icon={<User className="h-4 w-4" />} placeholder="الاسم الكامل" value={name} onChange={setName} />
                <Field icon={<Phone className="h-4 w-4" />} placeholder="رقم الهاتف" value={phone} onChange={setPhone} type="tel" />
              </>
            )}
            <Field icon={<Mail className="h-4 w-4" />} placeholder="البريد الإلكتروني" value={email} onChange={setEmail} type="email" required />
            <Field icon={<Lock className="h-4 w-4" />} placeholder="كلمة المرور" value={password} onChange={setPassword} type="password" required />

            <button disabled={loading} className="mt-2 w-full rounded-xl bg-gold-gradient py-3 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110 disabled:opacity-60">
              {loading ? "جارٍ المعالجة..." : mode === "login" ? "دخول" : "إنشاء حساب"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية.
          </p>
        </div>
        <Link to="/" className="mt-6 text-xs text-muted-foreground hover:text-gold">← العودة للرئيسية</Link>
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
