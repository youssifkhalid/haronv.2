export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_login_log: {
        Row: {
          created_at: string
          event: string
          id: number
          ip: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          meta?: Json | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          link_url: string | null
          message: string
          starts_at: string | null
          updated_at: string
          variant: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          message: string
          starts_at?: string | null
          updated_at?: string
          variant?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
          starts_at?: string | null
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      barber_portfolio_items: {
        Row: {
          barber_id: string
          caption: string | null
          created_at: string
          id: string
          media_type: string
          media_url: string
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          barber_id: string
          caption?: string | null
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          barber_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_portfolio_items_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          bio: string | null
          chair_number: number | null
          cover_url: string | null
          created_at: string
          facebook: string | null
          id: string
          instagram: string | null
          is_active: boolean
          is_present_now: boolean
          name: string
          photo_url: string | null
          rating: number | null
          sort_order: number
          tiktok: string | null
          title: string | null
          user_id: string | null
          whatsapp: string | null
          working_hours: Json | null
        }
        Insert: {
          bio?: string | null
          chair_number?: number | null
          cover_url?: string | null
          created_at?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          is_present_now?: boolean
          name: string
          photo_url?: string | null
          rating?: number | null
          sort_order?: number
          tiktok?: string | null
          title?: string | null
          user_id?: string | null
          whatsapp?: string | null
          working_hours?: Json | null
        }
        Update: {
          bio?: string | null
          chair_number?: number | null
          cover_url?: string | null
          created_at?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          is_present_now?: boolean
          name?: string
          photo_url?: string | null
          rating?: number | null
          sort_order?: number
          tiktok?: string | null
          title?: string | null
          user_id?: string | null
          whatsapp?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      blackout_dates: {
        Row: {
          blackout_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blackout_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blackout_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          barber_id: string | null
          booking_date: string
          booking_time: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          price_egp: number
          service_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          barber_id?: string | null
          booking_date: string
          booking_time: string
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          price_egp: number
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          barber_id?: string | null
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          price_egp?: number
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          body: string
          is_published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_points: {
        Row: {
          balance: number
          lifetime: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          lifetime?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          lifetime?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles_ext: {
        Row: {
          admin_notes: string | null
          is_blocked: boolean
          is_vip: boolean
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          is_blocked?: boolean
          is_vip?: boolean
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          is_blocked?: boolean
          is_vip?: boolean
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_subscriptions: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          is_active: boolean
          plan_id: string
          sessions_used: number
          starts_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          is_active?: boolean
          plan_id: string
          sessions_used?: number
          starts_on?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          plan_id?: string
          sessions_used?: number
          starts_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_egp: number
          category: string | null
          created_at: string
          created_by: string | null
          expense_date: string
          id: string
          is_debt: boolean
          notes: string | null
          paid: boolean
          title: string
          updated_at: string
        }
        Insert: {
          amount_egp: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          is_debt?: boolean
          notes?: string | null
          paid?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          amount_egp?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          is_debt?: boolean
          notes?: string | null
          paid?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          is_visible: boolean
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          is_visible?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          is_visible?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string
          channel: string
          is_active: boolean
          key: string
          label: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          channel?: string
          is_active?: boolean
          key: string
          label: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: string
          is_active?: boolean
          key?: string
          label?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          body: string | null
          channel: string | null
          created_at: string
          id: number
          meta: Json | null
          recipient: string | null
          status: string
          subject: string | null
          template_key: string | null
        }
        Insert: {
          body?: string | null
          channel?: string | null
          created_at?: string
          id?: number
          meta?: Json | null
          recipient?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
        }
        Update: {
          body?: string | null
          channel?: string | null
          created_at?: string
          id?: number
          meta?: Json | null
          recipient?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_info: string | null
          created_at: string
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          provider: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_info?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          provider?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_info?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          provider?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_proofs: {
        Row: {
          admin_notes: string | null
          amount_egp: number
          booking_id: string | null
          created_at: string
          id: string
          image_url: string | null
          method_id: string | null
          reference: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_egp: number
          booking_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          method_id?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_egp?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          method_id?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pos_transactions: {
        Row: {
          booking_id: string | null
          cashier_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          discount_egp: number
          id: string
          items: Json
          notes: string | null
          payment_method: string | null
          subtotal_egp: number
          total_egp: number
        }
        Insert: {
          booking_id?: string | null
          cashier_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_egp?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          subtotal_egp?: number
          total_egp?: number
        }
        Update: {
          booking_id?: string | null
          cashier_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_egp?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          subtotal_egp?: number
          total_egp?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          barber_id: string | null
          code: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          service_id: string | null
          starts_at: string | null
          updated_at: string
          uses_count: number
        }
        Insert: {
          barber_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          service_id?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Update: {
          barber_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          service_id?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          price_egp: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_egp: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_egp?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          price_egp: number
          sessions_included: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          price_egp: number
          sessions_included: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price_egp?: number
          sessions_included?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          barber_id: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          desired_date: string
          desired_time: string | null
          id: string
          notes: string | null
          service_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          barber_id?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          desired_date: string
          desired_time?: string | null
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          barber_id?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          desired_date?: string
          desired_time?: string | null
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer" | "barber"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer", "barber"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const
