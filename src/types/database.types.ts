export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: "income" | "expense";
          icon: string;
          color: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type: "income" | "expense";
          icon?: string;
          color?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: "income" | "expense";
          icon?: string;
          color?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: number;
          date: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: number;
          date?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: "income" | "expense";
          amount?: number;
          date?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          month: number;
          year: number;
          calculation_mode: "fixed" | "percentage";
          target_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          month: number;
          year: number;
          calculation_mode: "fixed" | "percentage";
          target_value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          month?: number;
          year?: number;
          calculation_mode?: "fixed" | "percentage";
          target_value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      gamification_profiles: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          total_xp: number;
          current_level: number;
          last_logged_date: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          total_xp?: number;
          current_level?: number;
          last_logged_date?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          total_xp?: number;
          current_level?: number;
          last_logged_date?: string | null;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          xp_reward: number;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          icon: string;
          xp_reward?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          xp_reward?: number;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          unlocked_at?: string;
        };
      };
    };
  };
}
