import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string; name: string; description: string | null; price_egp: number;
  duration_minutes: number; icon: string | null; is_active: boolean; sort_order: number;
};
export type Barber = {
  id: string; name: string; title: string | null; bio: string | null;
  photo_url: string | null; rating: number | null; is_active: boolean; sort_order: number;
};
export type Booking = {
  id: string; user_id: string; service_id: string; barber_id: string | null;
  booking_date: string; booking_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  customer_name: string; customer_phone: string; notes: string | null;
  price_egp: number; created_at: string;
};
export type Review = {
  id: string; user_id: string; rating: number; comment: string;
  is_approved: boolean; created_at: string;
};
export type GalleryImage = {
  id: string; title: string | null; image_url: string; alt_text: string | null;
  category: string | null; is_featured: boolean; is_visible: boolean; sort_order: number;
};
export type SiteSetting = {
  key: string; value: Record<string, any>; description: string | null; is_public: boolean;
};

export const servicesQuery = () => ({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return (data ?? []) as Service[];
  },
});

export const allServicesQuery = () => ({
  queryKey: ["services", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Service[];
  },
});

export const barbersQuery = () => ({
  queryKey: ["barbers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("barbers").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return (data ?? []) as Barber[];
  },
});

export const allBarbersQuery = () => ({
  queryKey: ["barbers", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("barbers").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Barber[];
  },
});

export const myBookingsQuery = (userId: string | undefined) => ({
  queryKey: ["bookings", "me", userId],
  enabled: !!userId,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, services(name, duration_minutes), barbers(name)")
      .eq("user_id", userId!)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const allBookingsQuery = () => ({
  queryKey: ["bookings", "all"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, services(name), barbers(name), profiles(full_name, phone)")
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  },
});


export const approvedReviewsQuery = () => ({
  queryKey: ["reviews", "approved"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reviews").select("*").eq("is_approved", true)
      .order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []) as Review[];
  },
});

export const allReviewsQuery = () => ({
  queryKey: ["reviews", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return (data ?? []) as Review[];
  },
});

export const myReviewQuery = (userId: string | undefined) => ({
  queryKey: ["reviews", "me", userId],
  enabled: !!userId,
  queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*")
      .eq("user_id", userId!).maybeSingle();
    if (error) throw error;
    return data as Review | null;
  },
});

export const galleryQuery = () => ({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase.from("gallery_images").select("*")
      .eq("is_visible", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as GalleryImage[];
  },
});

export const allGalleryQuery = () => ({
  queryKey: ["gallery", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("gallery_images").select("*")
      .order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as GalleryImage[];
  },
});

export const siteSettingsQuery = () => ({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const map: Record<string, SiteSetting> = {};
    for (const s of data ?? []) map[s.key] = s as any;
    return map;
  },
});

export const usersAdminQuery = () => ({
  queryKey: ["admin", "users"],
  queryFn: async () => {
    const [profiles, roles] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    if (profiles.error) throw profiles.error;
    if (roles.error) throw roles.error;
    const rolesByUser: Record<string, string[]> = {};
    for (const r of roles.data ?? []) {
      (rolesByUser[r.user_id] ||= []).push(r.role);
    }
    return (profiles.data ?? []).map((p: any) => ({ ...p, roles: rolesByUser[p.id] ?? [] }));
  },
});
