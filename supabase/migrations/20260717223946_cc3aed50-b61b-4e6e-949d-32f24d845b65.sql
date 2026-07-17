
-- Storage policies for media bucket: public read, admin write
CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Add FK for bookings.user_id -> profiles.id so admin bookings can embed profile info
ALTER TABLE public.bookings ADD CONSTRAINT bookings_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
