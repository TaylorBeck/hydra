import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/auth-provider';
import type { 
  Conversation, 
  ConversationListItem, 
  ConversationInsert, 
  ConversationUpdate,
  ConversationFilters
} from '@/types/chat';

// Type for the query result from Supabase
type ConversationQueryResult = {
  id: string;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  messages: Array<{
    id: string;
    content: string;
    role: string;
    created_at: string;
  }>;
};

// Fetch conversations with message counts
const fetchConversations = async (userId: string, filters?: ConversationFilters): Promise<ConversationListItem[]> => {
  let query = supabase
    .from('conversations')
    .select(`
      id,
      title,
      model_used,
      created_at,
      updated_at,
      archived_at,
      messages (
        id,
        content,
        role,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters?.archived !== undefined) {
    if (filters.archived) {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }
  }

  if (filters?.model) {
    query = query.eq('model_used', filters.model);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Transform data to include message counts and last message info
  return (data || []).map((conv: ConversationQueryResult) => {
    const messages = conv.messages || [];
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    return {
      id: conv.id,
      title: conv.title,
      model_used: conv.model_used,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      messageCount: messages.length,
      lastMessageContent: lastMessage?.content?.substring(0, 100),
      lastMessageAt: lastMessage?.created_at,
    };
  });
};

// Fetch single conversation with messages
const fetchConversation = async (conversationId: string, userId: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
};

// Create new conversation
const createConversation = async (data: ConversationInsert): Promise<Conversation> => {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return conversation;
};

// Update conversation
const updateConversation = async (id: string, updates: ConversationUpdate): Promise<Conversation> => {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete conversation
const deleteConversation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};

// Archive/unarchive conversation
const archiveConversation = async (id: string, archived: boolean): Promise<Conversation> => {
  const updates: ConversationUpdate = {
    archived_at: archived ? new Date().toISOString() : null,
  };

  return updateConversation(id, updates);
};

export function useConversations(filters?: ConversationFilters) {
  const { user, isAuthenticated } = useAuthContext();

  return useQuery<ConversationListItem[]>({
    queryKey: ['conversations', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      return fetchConversations(user.id, filters);
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Ensure empty arrays are treated as successful results
    select: (data) => data || [],
  });
}

export function useConversation(conversationId: string | null) {
  const { user, isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ['conversation', conversationId, user?.id],
    queryFn: () => conversationId ? fetchConversation(conversationId, user!.id) : null,
    enabled: isAuthenticated && !!user?.id && !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: (conversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      
      // Add to cache
      queryClient.setQueryData(['conversation', conversation.id, user?.id], conversation);
      
      toast.success('New conversation created');
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ConversationUpdate }) =>
      updateConversation(id, updates),
    onSuccess: (conversation) => {
      // Update conversation in cache
      queryClient.setQueryData(['conversation', conversation.id, user?.id], conversation);
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      
      toast.success('Conversation updated');
    },
    onError: (error) => {
      console.error('Failed to update conversation:', error);
      toast.error('Failed to update conversation');
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, conversationId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['conversation', conversationId, user?.id] });
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      
      toast.success('Conversation deleted');
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    },
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archiveConversation(id, archived),
    onSuccess: (conversation, { archived }) => {
      // Update conversation in cache
      queryClient.setQueryData(['conversation', conversation.id, user?.id], conversation);
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      
      toast.success(archived ? 'Conversation archived' : 'Conversation restored');
    },
    onError: (error) => {
      console.error('Failed to archive conversation:', error);
      toast.error('Failed to update conversation');
    },
  });
}
