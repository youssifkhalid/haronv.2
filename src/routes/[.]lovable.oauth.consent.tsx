import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";

type AuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): AuthOAuth {
  return (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-destructive">تعذّر تحميل طلب الربط: {String((error as Error)?.message ?? error)}</p>
      </main>
    </SiteLayout>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as any;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("لم يُرجع خادم التفويض رابط عودة."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "تطبيق خارجي";
  const scopes: string[] = details?.scope?.split?.(" ") ?? details?.scopes ?? [];

  return (
    <SiteLayout>
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <Logo size={56} />
        <div className="mt-8 w-full rounded-3xl border border-gold/10 bg-card p-6 shadow-elegant sm:p-8">
          <h1 className="text-center text-xl font-black">ربط {clientName} بحسابك</h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            سيتمكّن <b>{clientName}</b> من استخدام أدوات صالون هارون نيابةً عنك (استعراض الخدمات، الحلاقين، وإدارة حجوزاتك الشخصية).
          </p>
          {scopes.length > 0 && (
            <ul className="mt-4 space-y-1 rounded-xl border border-border bg-surface-elevated p-3 text-xs text-muted-foreground">
              {scopes.map((s) => <li key={s}>• {s}</li>)}
            </ul>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            لن يتم تجاوز صلاحياتك — كل عملية تخضع لسياسات الأمان الخاصة بحسابك.
          </p>
          {error && <p className="mt-3 text-center text-xs text-destructive" role="alert">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button disabled={busy} onClick={() => decide(false)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-bold hover:bg-accent/40 disabled:opacity-60">
              رفض
            </button>
            <button disabled={busy} onClick={() => decide(true)}
              className="flex-1 rounded-xl bg-gold-gradient py-3 text-sm font-black text-gold-foreground shadow-gold hover:brightness-110 disabled:opacity-60">
              {busy ? "جارٍ..." : "موافقة والربط"}
            </button>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
