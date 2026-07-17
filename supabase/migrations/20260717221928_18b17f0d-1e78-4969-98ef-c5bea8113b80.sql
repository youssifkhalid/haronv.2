
-- Gallery images (admin-managed)
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  alt_text text,
  category text,
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage gallery" ON public.gallery_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER gallery_touch BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Site settings (key/value store for editable site content)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (is_public OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('contact', '{"phone":"+20 100 000 0000","whatsapp":"+20 100 000 0000","email":"info@haroun.eg","address":"القاهرة، مصر","map_url":""}'::jsonb, 'معلومات التواصل'),
  ('hours', '{"sat":"11:00-23:00","sun":"11:00-23:00","mon":"11:00-23:00","tue":"11:00-23:00","wed":"11:00-23:00","thu":"11:00-23:00","fri":"مغلق"}'::jsonb, 'ساعات العمل'),
  ('social', '{"instagram":"","facebook":"","tiktok":"","youtube":""}'::jsonb, 'حسابات التواصل الاجتماعي'),
  ('hero', '{"title":"صالون هارون","subtitle":"فن الحلاقة الرجالية بلمسة ملكية","cta":"احجز موعدك"}'::jsonb, 'قسم البداية بالرئيسية');

-- Admin can update/delete any profile
CREATE POLICY "admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can manage user_roles (assign/revoke roles for any user)
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
