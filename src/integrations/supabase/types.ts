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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banned_users: {
        Row: {
          ban_type: string
          banned_by: string | null
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          phone: string | null
          reason: string | null
        }
        Insert: {
          ban_type?: string
          banned_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          phone?: string | null
          reason?: string | null
        }
        Update: {
          ban_type?: string
          banned_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          phone?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          city: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          giveaway_item: string | null
          id: string
          image_url: string | null
          is_giveaway: boolean
          province: string
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          category?: string
          city: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          giveaway_item?: string | null
          id?: string
          image_url?: string | null
          is_giveaway?: boolean
          province: string
          title: string
          updated_at?: string
          venue: string
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          giveaway_item?: string | null
          id?: string
          image_url?: string | null
          is_giveaway?: boolean
          province?: string
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      league_visibility: {
        Row: {
          is_visible: boolean
          league: string
          updated_at: string
        }
        Insert: {
          is_visible?: boolean
          league: string
          updated_at?: string
        }
        Update: {
          is_visible?: boolean
          league?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          price_paid: number
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          price_paid?: number
          starts_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          price_paid?: number
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          body: string
          created_at: string
          id: string
          recipient_count: number
          sent_by: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipient_count?: number
          sent_by: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipient_count?: number
          sent_by?: string
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          quantity: number
          ticket_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          quantity?: number
          ticket_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          ticket_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "public_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      order_transfers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          order_id: string
          seller_id: string
          status: string
          ticket_id: string
          transfer_image_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          seller_id: string
          status?: string
          ticket_id: string
          transfer_image_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          seller_id?: string
          status?: string
          ticket_id?: string
          transfer_image_url?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_transfers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_transfers_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "public_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_transfers_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          fees_amount: number
          flight_added: boolean
          hotel_added: boolean
          id: string
          is_fee_waived: boolean
          status: string
          total_amount: number
          uber_added: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          fees_amount?: number
          flight_added?: boolean
          hotel_added?: boolean
          id?: string
          is_fee_waived?: boolean
          status?: string
          total_amount: number
          uber_added?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          fees_amount?: number
          flight_added?: boolean
          hotel_added?: boolean
          id?: string
          is_fee_waived?: boolean
          status?: string
          total_amount?: number
          uber_added?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          province: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reseller_leagues: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          league: string
          reseller_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          league: string
          reseller_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          league?: string
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_leagues_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          acknowledgment_initials: string | null
          acknowledgment_name: string | null
          acknowledgment_signed_at: string | null
          agreement_accepted_at: string | null
          business_name: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_enabled: boolean
          is_suspended: boolean
          last_name: string | null
          phone: string | null
          status: string
          stripe_customer_id: string | null
          ticket_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledgment_initials?: string | null
          acknowledgment_name?: string | null
          acknowledgment_signed_at?: string | null
          agreement_accepted_at?: string | null
          business_name: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_enabled?: boolean
          is_suspended?: boolean
          last_name?: string | null
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          ticket_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledgment_initials?: string | null
          acknowledgment_name?: string | null
          acknowledgment_signed_at?: string | null
          agreement_accepted_at?: string | null
          business_name?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_enabled?: boolean
          is_suspended?: boolean
          last_name?: string | null
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          ticket_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seat_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_images_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "public_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_images_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_discount_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      seller_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          discount_code: string | null
          id: string
          reseller_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          weekly_fee: number
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          discount_code?: string | null
          id?: string
          reseller_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          weekly_fee?: number
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          discount_code?: string | null
          id?: string
          reseller_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          weekly_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: true
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          face_value: number | null
          hide_seat_numbers: boolean
          id: string
          is_active: boolean
          is_reseller_ticket: boolean
          order_number: string | null
          perks: string[] | null
          price: number
          quantity: number
          quantity_sold: number
          row_name: string | null
          sales_tax_paid: boolean
          seat_notes: string | null
          seat_number: string | null
          seat_type: string | null
          section: string
          seller_id: string | null
          split_type: string | null
          stock_type: string | null
          ticket_group_account: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          face_value?: number | null
          hide_seat_numbers?: boolean
          id?: string
          is_active?: boolean
          is_reseller_ticket?: boolean
          order_number?: string | null
          perks?: string[] | null
          price: number
          quantity?: number
          quantity_sold?: number
          row_name?: string | null
          sales_tax_paid?: boolean
          seat_notes?: string | null
          seat_number?: string | null
          seat_type?: string | null
          section: string
          seller_id?: string | null
          split_type?: string | null
          stock_type?: string | null
          ticket_group_account?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          face_value?: number | null
          hide_seat_numbers?: boolean
          id?: string
          is_active?: boolean
          is_reseller_ticket?: boolean
          order_number?: string | null
          perks?: string[] | null
          price?: number
          quantity?: number
          quantity_sold?: number
          row_name?: string | null
          sales_tax_paid?: boolean
          seat_notes?: string | null
          seat_number?: string | null
          seat_type?: string | null
          section?: string
          seller_id?: string | null
          split_type?: string | null
          stock_type?: string | null
          ticket_group_account?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_tickets: {
        Row: {
          created_at: string | null
          event_id: string | null
          face_value: number | null
          hide_seat_numbers: boolean | null
          id: string | null
          is_active: boolean | null
          is_reseller_ticket: boolean | null
          perks: string[] | null
          price: number | null
          quantity: number | null
          quantity_sold: number | null
          row_name: string | null
          sales_tax_paid: boolean | null
          seat_notes: string | null
          seat_number: string | null
          seat_type: string | null
          section: string | null
          seller_id: string | null
          split_type: string | null
          stock_type: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          face_value?: number | null
          hide_seat_numbers?: boolean | null
          id?: string | null
          is_active?: boolean | null
          is_reseller_ticket?: boolean | null
          perks?: string[] | null
          price?: number | null
          quantity?: number | null
          quantity_sold?: number | null
          row_name?: string | null
          sales_tax_paid?: boolean | null
          seat_notes?: string | null
          seat_number?: never
          seat_type?: string | null
          section?: string | null
          seller_id?: string | null
          split_type?: string | null
          stock_type?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          face_value?: number | null
          hide_seat_numbers?: boolean | null
          id?: string | null
          is_active?: boolean | null
          is_reseller_ticket?: boolean | null
          perks?: string[] | null
          price?: number | null
          quantity?: number | null
          quantity_sold?: number | null
          row_name?: string | null
          sales_tax_paid?: boolean | null
          seat_notes?: string | null
          seat_number?: never
          seat_type?: string | null
          section?: string | null
          seller_id?: string | null
          split_type?: string | null
          stock_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_membership: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_email_banned: { Args: { _email: string }; Returns: boolean }
      is_ip_banned: { Args: { _ip: string }; Returns: boolean }
      is_phone_banned: { Args: { _phone: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "reseller"
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
      app_role: ["admin", "customer", "reseller"],
    },
  },
} as const
