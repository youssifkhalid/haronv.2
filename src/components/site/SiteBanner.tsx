import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, Sparkles, Check } from "lucide-react";
import { activeBannersQuery } from "@/lib/queries";

const icons: any = { info: Info, warning: AlertTriangle, promo: Sparkles, success: Check };
const styles: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  promo: "bg-gold/10 text-gold border-gold/30",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export function SiteBanner() {
  const { data: banners = [] } = useQuery(activeBannersQuery());
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try { setDismissed(JSON.parse(localStorage.getItem("dismissed_banners") ?? "[]")); } catch {}
  }, []);

  const visible = banners.filter((b: any) => !dismissed.includes(b.id));
  if (!visible.length) return null;

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("dismissed_banners", JSON.stringify(next));
  }

  return (
    <div className="space-y-1 px-3 pt-2">
      {visible.map((b: any) => {
        const Icon = icons[b.variant] ?? Info;
        return (
          <div key={b.id} className={`mx-auto flex max-w-7xl items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${styles[b.variant] ?? styles.info}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <div className="flex-1 truncate">
              {b.link_url ? <a href={b.link_url} className="hover:underline">{b.message}</a> : b.message}
            </div>
            <button onClick={() => dismiss(b.id)} className="rounded-full p-1 hover:bg-black/20" aria-label="إغلاق">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
