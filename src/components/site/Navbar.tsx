import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth, useRoles } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/services", label: "الخدمات" },
  { to: "/barbers", label: "الحلاقين" },
  { to: "/booking", label: "احجز الآن" },
  { to: "/contact", label: "تواصل" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
  }

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "glass shadow-elegant" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0"><Logo /></Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/85 transition hover:bg-accent/40 hover:text-gold [&.active]:text-gold"
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent inline-flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> الإدارة
                </Link>
              )}
              <Link to="/account" className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> حسابي
              </Link>
              <button onClick={signOut} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground" aria-label="تسجيل الخروج">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-lg border border-gold/40 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10">
              تسجيل الدخول
            </Link>
          )}
          <Link
            to="/booking"
            className="rounded-lg bg-gold-gradient px-4 py-2 text-sm font-black text-gold-foreground shadow-gold transition hover:brightness-110"
          >
            احجز موعد
          </Link>
        </div>

        <button
          className="rounded-lg border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass border-t border-gold/10 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent/40">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Link to="/account" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-2 text-center text-sm font-semibold">حسابي</Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="rounded-lg border border-border px-3 py-2 text-sm">خروج</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="col-span-2 rounded-lg border border-gold/40 px-3 py-2 text-center text-sm font-bold text-gold">تسجيل الدخول</Link>
              )}
              <Link to="/booking" onClick={() => setOpen(false)} className="col-span-2 rounded-lg bg-gold-gradient px-3 py-2.5 text-center text-sm font-black text-gold-foreground">
                احجز موعد
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
