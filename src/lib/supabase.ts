import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          openai_api_key: string | null;
          anthropic_api_key: string | null;
          google_api_key: string | null;
          mistral_api_key: string | null;
          groq_api_key: string | null;
          xai_api_key: string | null;
          deepseek_api_key: string | null;
          cerebras_api_key: string | null;
          perplexity_api_key: string | null;
          default_temperature: number | null;
          default_max_output_tokens: number | null;
          default_top_p: number | null;
          default_top_k: number | null;
          default_presence_penalty: number | null;
          default_frequency_penalty: number | null;
          default_max_retries: number | null;
          default_stop_sequences: string | null;
          preferred_model: string | null;
          theme: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          openai_api_key?: string | null;
          anthropic_api_key?: string | null;
          google_api_key?: string | null;
          mistral_api_key?: string | null;
          groq_api_key?: string | null;
          xai_api_key?: string | null;
          deepseek_api_key?: string | null;
          cerebras_api_key?: string | null;
          perplexity_api_key?: string | null;
          default_temperature?: number | null;
          default_max_output_tokens?: number | null;
          default_top_p?: number | null;
          default_top_k?: number | null;
          default_presence_penalty?: number | null;
          default_frequency_penalty?: number | null;
          default_max_retries?: number | null;
          default_stop_sequences?: string | null;
          preferred_model?: string | null;
          theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          openai_api_key?: string | null;
          anthropic_api_key?: string | null;
          google_api_key?: string | null;
          mistral_api_key?: string | null;
          groq_api_key?: string | null;
          xai_api_key?: string | null;
          deepseek_api_key?: string | null;
          cerebras_api_key?: string | null;
          perplexity_api_key?: string | null;
          default_temperature?: number | null;
          default_max_output_tokens?: number | null;
          default_top_p?: number | null;
          default_top_k?: number | null;
          default_presence_penalty?: number | null;
          default_frequency_penalty?: number | null;
          default_max_retries?: number | null;
          default_stop_sequences?: string | null;
          preferred_model?: string | null;
          theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model_used: string;
          model_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          model_used: string;
          model_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          model_used?: string;
          model_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          content_type: 'text' | 'image' | 'tool_call' | 'tool_result';
          metadata: Record<string, unknown>;
          token_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          content_type?: 'text' | 'image' | 'tool_call' | 'tool_result';
          metadata?: Record<string, unknown>;
          token_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          content_type?: 'text' | 'image' | 'tool_call' | 'tool_result';
          metadata?: Record<string, unknown>;
          token_count?: number | null;
          created_at?: string;
        };
      };
      api_usage: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string | null;
          provider: string;
          model: string;
          input_tokens: number | null;
          output_tokens: number | null;
          total_tokens: number | null;
          cost_estimate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id?: string | null;
          provider: string;
          model: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cost_estimate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string | null;
          provider?: string;
          model?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cost_estimate?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type ApiUsage = Database['public']['Tables']['api_usage']['Row'];
