import type { Database } from '@/lib/supabase';

// Database types
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type ApiUsage = Database['public']['Tables']['api_usage']['Row'];

// Insert types
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

// Update types
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

// Extended types for UI
export interface ConversationWithMessages extends Conversation {
  messages?: Message[];
  messageCount?: number;
  lastMessage?: Message;
}

export interface ConversationListItem {
  id: string;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
  lastMessageContent?: string;
  lastMessageAt?: string;
}

// Chat message types (compatible with AI SDK)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

// Conversation creation data
export interface CreateConversationData {
  title: string;
  model: string;
  modelSettings?: Record<string, unknown>;
  firstMessage?: string;
}

// Search and filter types
export interface ConversationFilters {
  search?: string;
  model?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  archived?: boolean;
}

export interface ConversationSearchResult {
  conversation: ConversationListItem;
  matchedMessages: Array<{
    id: string;
    content: string;
    role: string;
    created_at: string;
  }>;
}

// Export types
export interface ExportOptions {
  format: 'json' | 'markdown' | 'txt';
  includeMetadata: boolean;
  includeModelSettings: boolean;
}

export interface ExportData {
  conversation: Conversation;
  messages: Message[];
  exportedAt: string;
  format: string;
}
