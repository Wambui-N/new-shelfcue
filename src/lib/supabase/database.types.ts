export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      forms: {
        Row: {
          calendar_settings: Json | null;
          created_at: string;
          default_calendar_id: string | null;
          default_sheet_connection_id: string | null;
          description: string | null;
          drive_folder_id: string | null;
          fields: Json;
          file_settings: Json | null;
          id: string;
          meeting_settings: Json | null;
          settings: Json;
          status: string;
          theme: Json | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calendar_settings?: Json | null;
          created_at?: string;
          default_calendar_id?: string | null;
          default_sheet_connection_id?: string | null;
          description?: string | null;
          drive_folder_id?: string | null;
          fields: Json;
          file_settings?: Json | null;
          id?: string;
          meeting_settings?: Json | null;
          settings: Json;
          status: string;
          theme?: Json | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calendar_settings?: Json | null;
          created_at?: string;
          default_calendar_id?: string | null;
          default_sheet_connection_id?: string | null;
          description?: string | null;
          drive_folder_id?: string | null;
          fields?: Json;
          file_settings?: Json | null;
          id?: string;
          meeting_settings?: Json | null;
          settings?: Json;
          status?: string;
          theme?: Json | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forms_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          customer_id: string;
          id: string;
          status: string;
          subscription_id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency: string;
          customer_id: string;
          id?: string;
          status: string;
          subscription_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          id?: string;
          status?: string;
          subscription_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "user_subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_authorizations: {
        Row: {
          authorization_code: string;
          bin: string;
          brand: string;
          card_type: string;
          country_code: string;
          created_at: string;
          customer_id: string;
          email: string;
          exp_month: string;
          exp_year: string;
          id: string;
          last4: string;
          reusable: boolean;
          signature: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          authorization_code: string;
          bin: string;
          brand: string;
          card_type: string;
          country_code: string;
          created_at?: string;
          customer_id: string;
          email: string;
          exp_month: string;
          exp_year: string;
          id?: string;
          last4: string;
          reusable: boolean;
          signature: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          authorization_code?: string;
          bin?: string;
          brand?: string;
          card_type?: string;
          country_code?: string;
          created_at?: string;
          customer_id?: string;
          email?: string;
          exp_month?: string;
          exp_year?: string;
          id?: string;
          last4?: string;
          reusable?: boolean;
          signature?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_authorizations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_transactions: {
        Row: {
          amount: number;
          authorization_code: string | null;
          created_at: string | null;
          currency: string | null;
          gateway_response: string | null;
          id: string;
          invoice_id: string | null;
          metadata: Json | null;
          paid_at: string | null;
          paystack_reference: string;
          paystack_transaction_id: number | null;
          payment_method: string | null;
          status: string;
          subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          authorization_code?: string | null;
          created_at?: string | null;
          currency?: string | null;
          gateway_response?: string | null;
          id?: string;
          invoice_id?: string | null;
          metadata?: Json | null;
          paid_at?: string | null;
          paystack_reference: string;
          paystack_transaction_id?: number | null;
          payment_method?: string | null;
          status: string;
          subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          authorization_code?: string | null;
          created_at?: string | null;
          currency?: string | null;
          gateway_response?: string | null;
          id?: string;
          invoice_id?: string | null;
          metadata?: Json | null;
          paid_at?: string | null;
          paystack_reference?: string;
          paystack_transaction_id?: number | null;
          payment_method?: string | null;
          status?: string;
          subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string;
          description: string | null;
          features: Json | null;
          id: string;
          name: string;
          price: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          features?: Json | null;
          id?: string;
          name: string;
          price: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          features?: Json | null;
          id?: string;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      subscription_cancellations: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string;
          reason: string;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id: string;
          reason: string;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string;
          reason?: string;
          feedback?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_cancellations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscription_cancellations_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "user_subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          price_monthly: number;
          is_active: boolean;
          features: Json | null;
          limits: Json | null;
          paystack_plan_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          price_monthly: number;
          is_active?: boolean;
          features?: Json | null;
          limits?: Json | null;
          paystack_plan_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          price_monthly?: number;
          is_active?: boolean;
          features?: Json | null;
          limits?: Json | null;
          paystack_plan_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sheet_connections: {
        Row: {
          created_at: string;
          form_id: string;
          id: string;
          sheet_id: string;
          sheet_name: string;
          sheet_url: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          form_id: string;
          id?: string;
          sheet_id: string;
          sheet_name: string;
          sheet_url: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          form_id?: string;
          id?: string;
          sheet_id?: string;
          sheet_name?: string;
          sheet_url?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sheet_connections_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sheet_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          content: Json | null;
          created_at: string;
          form_id: string;
          id: string;
          seen: boolean;
        };
        Insert: {
          content?: Json | null;
          created_at?: string;
          form_id: string;
          id?: string;
          seen?: boolean;
        };
        Update: {
          content?: Json | null;
          created_at?: string;
          form_id?: string;
          id?: string;
          seen?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_tracking: {
        Row: {
          created_at: string;
          credits_used: number;
          id: string;
          plan_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          credits_used: number;
          id?: string;
          plan_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          credits_used?: number;
          id?: string;
          plan_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_tracking_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_google_tokens: {
        Row: {
          access_token: string;
          created_at: string;
          expires_at: number;
          id: string;
          refresh_token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string;
          expires_at: number;
          id?: string;
          refresh_token: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          expires_at?: number;
          id?: string;
          refresh_token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_google_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          trial_start: string | null;
          trial_end: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          billing_cycle: string | null;
          paystack_subscription_code: string | null;
          cancel_at_period_end: boolean | null;
          is_trial: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          trial_start?: string | null;
          trial_end?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          billing_cycle?: string | null;
          paystack_subscription_code?: string | null;
          cancel_at_period_end?: boolean | null;
          is_trial?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          trial_start?: string | null;
          trial_end?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          billing_cycle?: string | null;
          paystack_subscription_code?: string | null;
          cancel_at_period_end?: boolean | null;
          is_trial?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_trial_subscription_on_signup: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          aud: string;
          role: string;
          email: string;
          phone: string;
          created_at: string;
          updated_at: string;
          last_sign_in_at: string;
          app_metadata: Json;
          user_metadata: Json;
          identities: Json;
          new_session_nonce: string;
          is_anonymous: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
