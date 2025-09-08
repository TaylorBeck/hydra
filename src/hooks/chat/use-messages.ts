import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/auth-provider';
import type { Message, MessageInsert, ChatMessage } from '@/types/chat';

// Fetch messages for a conversation
const fetchMessages = async (conversationId: string, userId: string): Promise<Message[]> => {
  // First verify the conversation belongs to the user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError || !conversation) {
    throw new Error('Conversation not found or access denied');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

// Add message to conversation
const addMessage = async (message: MessageInsert): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Add multiple messages (for bulk operations)
const addMessages = async (messages: MessageInsert[]): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messages)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
};

// Delete message
const deleteMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    throw error;
  }
};

// Search messages across conversations
const searchMessages = async (userId: string, query: string, limit: number = 50): Promise<Array<{
  message: Message;
  conversation: { id: string; title: string; model_used: string };
}>> => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      conversations!inner (
        id,
        title,
        model_used,
        user_id
      )
    `)
    .eq('conversations.user_id', userId)
    .textSearch('content', query)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => ({
    message: {
      id: item.id,
      conversation_id: item.conversation_id,
      role: item.role,
      content: item.content,
      content_type: item.content_type,
      metadata: item.metadata,
      token_count: item.token_count,
      created_at: item.created_at,
    },
    conversation: item.conversations,
  }));
};

// Convert database messages to chat messages (AI SDK format)
export const convertToAIMessages = (messages: Message[]): ChatMessage[] => {
  return messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    createdAt: new Date(msg.created_at),
  }));
};

// Convert AI messages to database format
export const convertToDBMessages = (
  messages: ChatMessage[], 
  conversationId: string
): MessageInsert[] => {
  return messages.map(msg => ({
    conversation_id: conversationId,
    role: msg.role,
    content: msg.content,
    content_type: 'text',
    metadata: {},
  }));
};

export function useMessages(conversationId: string | null) {
  const { user, isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ['messages', conversationId, user?.id],
    queryFn: () => conversationId ? fetchMessages(conversationId, user!.id) : [],
    enabled: isAuthenticated && !!user?.id && !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: addMessage,
    onSuccess: (message) => {
      // Add message to cache
      queryClient.setQueryData(
        ['messages', message.conversation_id, user?.id],
        (old: Message[] = []) => [...old, message]
      );

      // Update conversation's updated_at timestamp in cache
      queryClient.invalidateQueries({ 
        queryKey: ['conversations', user?.id] 
      });
    },
    onError: (error) => {
      console.error('Failed to add message:', error);
      toast.error('Failed to save message');
    },
  });
}

export function useAddMessages() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: addMessages,
    onSuccess: (messages) => {
      if (messages.length === 0) return;

      const conversationId = messages[0].conversation_id;
      
      // Add messages to cache
      queryClient.setQueryData(
        ['messages', conversationId, user?.id],
        (old: Message[] = []) => [...old, ...messages]
      );

      // Update conversation's updated_at timestamp in cache
      queryClient.invalidateQueries({ 
        queryKey: ['conversations', user?.id] 
      });
    },
    onError: (error) => {
      console.error('Failed to add messages:', error);
      toast.error('Failed to save messages');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (_, messageId) => {
      // Remove message from all conversation caches
      queryClient.setQueriesData(
        { queryKey: ['messages'] },
        (old: Message[] | undefined) => {
          if (!old) return old;
          return old.filter(msg => msg.id !== messageId);
        }
      );

      toast.success('Message deleted');
    },
    onError: (error) => {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    },
  });
}

export function useSearchMessages(query: string, enabled: boolean = true) {
  const { user, isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ['search-messages', user?.id, query],
    queryFn: () => searchMessages(user!.id, query),
    enabled: isAuthenticated && !!user?.id && !!query.trim() && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
