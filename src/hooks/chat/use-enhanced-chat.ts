import { useState, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/auth-provider';
import { useSettings } from '@/hooks/use-settings';
import { useCreateConversation, useUpdateConversation } from './use-conversations';
import { useMessages } from './use-messages';
import type { ChatMessage, CreateConversationData } from '@/types/chat';

interface UseEnhancedChatOptions {
  conversationId?: string | null;
  model?: string;
  onConversationCreated?: (conversationId: string) => void;
  onError?: (error: Error) => void;
}

interface EnhancedChatState {
  conversationId: string | null;
  isCreatingConversation: boolean;
  isSavingMessages: boolean;
}

export function useEnhancedChat({
  conversationId: initialConversationId = null,
  model = 'gpt-4o',
  onConversationCreated,
  onError,
}: UseEnhancedChatOptions = {}) {
  const { user, isAuthenticated } = useAuthContext();
  const fallbackSettings = useSettings(); // For non-authenticated users
  const [state, setState] = useState<EnhancedChatState>({
    conversationId: initialConversationId,
    isCreatingConversation: false,
    isSavingMessages: false,
  });

  const createConversationMutation = useCreateConversation();
  const updateConversationMutation = useUpdateConversation();
  
  // Load existing messages if we have a conversation ID
  const { isLoading: isLoadingMessages } = useMessages(
    state.conversationId
  );

  // Convert existing messages to AI SDK format (for future use)
  // const initialMessages = convertToAIMessages(existingMessages);

  // Get API endpoint - use Edge Function if authenticated, fallback to local API (for future use)
  // const getApiEndpoint = useCallback(() => {
  //   if (isAuthenticated && user) {
  //     return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`;
  //   }
  //   return '/api/chat';
  // }, [isAuthenticated, user]);

  // Get headers for the request (for future use)
  // const getHeaders = useCallback(() => {
  //   const headers: Record<string, string> = {
  //     'Content-Type': 'application/json',
  //   };

  //   if (isAuthenticated && session) {
  //     // Add authorization header for Supabase Edge Function
  //     headers['Authorization'] = `Bearer ${session.access_token}`;
  //   }

  //   return headers;
  // }, [isAuthenticated, session]);

  // Generate conversation title from first message
  const generateTitle = useCallback((content: string): string => {
    const words = content.split(' ').slice(0, 8);
    let title = words.join(' ');
    if (content.split(' ').length > 8) {
      title += '...';
    }
    return title || 'New Chat';
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage: string): Promise<string> => {
    if (!isAuthenticated || !user) {
      throw new Error('Authentication required');
    }

    setState(prev => ({ ...prev, isCreatingConversation: true }));

    try {
      const conversationData: CreateConversationData = {
        title: generateTitle(firstMessage),
        model,
        modelSettings: (fallbackSettings?.modelSettings || {}) as unknown as Record<string, unknown>,
        firstMessage,
      };

      const conversation = await createConversationMutation.mutateAsync({
        user_id: user.id,
        title: conversationData.title,
        model_used: conversationData.model,
        model_settings: conversationData.modelSettings,
      });

      setState(prev => ({ 
        ...prev, 
        conversationId: conversation.id,
        isCreatingConversation: false 
      }));

      onConversationCreated?.(conversation.id);
      return conversation.id;
    } catch (error) {
      setState(prev => ({ ...prev, isCreatingConversation: false }));
      throw error;
    }
  }, [isAuthenticated, user, model, fallbackSettings, generateTitle, createConversationMutation, onConversationCreated]);

  // Update conversation title if needed
  const updateConversationTitle = useCallback(async (conversationId: string, newTitle: string) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { title: newTitle },
      });
    } catch (error) {
      console.error('Failed to update conversation title:', error);
    }
  }, [updateConversationMutation]);

  // Local input state management
  const [input, setInput] = useState('');

  // Enhanced chat hook with persistence
  const { messages, sendMessage } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      onError?.(error);
    },
  });

  // Track loading state manually
  const [isSending, setIsSending] = useState(false);

  // Enhanced append function that handles conversation creation
  const enhancedAppend = useCallback(async (message: ChatMessage | string) => {
    const messageContent = typeof message === 'string' ? message : message.content;
    
    try {
      setIsSending(true);
      
      // If authenticated but no conversation exists, create one
      if (isAuthenticated && !state.conversationId && !state.isCreatingConversation) {
        await createConversation(messageContent);
      }

      // Send the message using the AI SDK's sendMessage method
      await sendMessage({
        text: messageContent,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      onError?.(error as Error);
    } finally {
      setIsSending(false);
    }
  }, [isAuthenticated, state.conversationId, state.isCreatingConversation, createConversation, sendMessage, onError]);

  // Set conversation ID (for switching between conversations)
  const setConversationId = useCallback((newConversationId: string | null) => {
    setState(prev => ({ ...prev, conversationId: newConversationId }));
  }, []);

  // Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setState(prev => ({ ...prev, conversationId: null }));
    setInput('');
    // Note: We can't clear messages from useChat hook directly in this version
  }, []);

  return {
    // Chat state and functions from AI SDK
    messages,
    input,
    handleInputChange,
    isLoading: isSending || state.isCreatingConversation,
    error: null, // We'll handle errors in our enhanced append function

    // Enhanced functions
    append: enhancedAppend,
    setConversationId,
    startNewConversation,
    updateConversationTitle,
    setInput,

    // Enhanced state
    conversationId: state.conversationId,
    isCreatingConversation: state.isCreatingConversation,
    isSavingMessages: state.isSavingMessages,
    isLoadingMessages,
    isAuthenticated,

    // Computed state
    hasMessages: messages.length > 0,
    canSave: isAuthenticated && !!user,
  };
}
