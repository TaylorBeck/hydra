'use client';

import { useState, useEffect } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectGroup,
  PromptInputModelSelectItem,
  PromptInputModelSelectLabel,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { Loader } from '@/components/ai-elements/loader';
import { ConversationSidebar } from './conversation-sidebar';
import { useEnhancedChat } from '@/hooks/chat/use-enhanced-chat';
import { useAuthContext } from '@/components/auth/auth-provider';
import { TypingTitle } from '@/components/typing-title';
import { cn } from '@/lib/utils';
import type { UIMessage } from 'ai';

const modelsByProvider = {
  OpenAI: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  Anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  Google: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  ],
  Mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large' },
    { id: 'mistral-small-latest', name: 'Mistral Small' },
  ],
};

// Flatten models for easy lookup
const allModels = Object.entries(modelsByProvider).flatMap(([provider, models]) =>
  models.map(model => ({ ...model, provider }))
);

// Extract model names for typing animation
const modelNames = allModels.map(model => model.name);

// Helper function to extract text content from UIMessage parts
const getMessageContent = (message: UIMessage): string => {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('');
};

interface EnhancedChatInterfaceProps {
  className?: string;
  // Mobile sidebar props - when provided, use external state management
  isMobile?: boolean;
  isMobileSidebarOpen?: boolean;
  onMobileSidebarOpenChange?: (open: boolean) => void;
}

// Hook to manage mobile sidebar state - can be used by parent components
export function useMobileSidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return {
    isMobile,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar: () => setIsMobileSidebarOpen(!isMobileSidebarOpen),
  };
}

export function EnhancedChatInterface({ 
  className,
  isMobile: externalIsMobile,
  isMobileSidebarOpen: externalIsMobileSidebarOpen,
  onMobileSidebarOpenChange: externalOnMobileSidebarOpenChange
}: EnhancedChatInterfaceProps) {
  const [model, setModel] = useState(allModels[0].id);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [hasSubmittedFirstMessage, setHasSubmittedFirstMessage] = useState(false);
  const { isAuthenticated } = useAuthContext();
  
  // Use external mobile state if provided, otherwise use internal hook
  const internalMobileState = useMobileSidebar();
  const isMobile = externalIsMobile ?? internalMobileState.isMobile;
  const isMobileSidebarOpen = externalIsMobileSidebarOpen ?? internalMobileState.isMobileSidebarOpen;
  const setIsMobileSidebarOpen = externalOnMobileSidebarOpenChange ?? internalMobileState.setIsMobileSidebarOpen;

  // Note: conversations data is used by parent components via the hook

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    append,
    setConversationId,
    startNewConversation,
    isCreatingConversation,
    isLoadingMessages,
    setInput,
  } = useEnhancedChat({
    conversationId: currentConversationId,
    model,
    onConversationCreated: (newConversationId) => {
      setCurrentConversationId(newConversationId);
    },
  });

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setConversationId(conversationId);
    setHasSubmittedFirstMessage(false); // Reset since we're loading existing messages
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setHasSubmittedFirstMessage(false);
    startNewConversation();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input?.trim()) {
      const messageText = input.trim();
      setInput(''); // Clear input immediately
      
      // Mark that we've submitted the first message (for transition to conversation view)
      if (messages.length === 0) {
        setHasSubmittedFirstMessage(true);
      }
      
      try {
        await append(messageText);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Restore input if sending failed
        setInput(messageText);
        // Reset the submission state if there was an error
        if (messages.length === 0) {
          setHasSubmittedFirstMessage(false);
        }
      }
    }
  };

  const showSidebar = isAuthenticated;
  const hasMessages = messages.length > 0;
  const shouldShowConversation = hasMessages || hasSubmittedFirstMessage;

  return (
    <div className={cn('flex h-full', className)}>
      {/* Desktop Sidebar */}
      {showSidebar && !isMobile && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      )}

      {/* Mobile Sidebar */}
      {showSidebar && isMobile && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          isMobile={true}
          isOpen={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!shouldShowConversation ? (
          // Empty state with centered prompt input
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-0 px-4 sm:px-6">
            <div className="w-full max-w-2xl transform transition-all duration-700 ease-out">
              <TypingTitle 
                models={modelNames} 
                className="animate-in fade-in-0 slide-in-from-top-4 duration-1000 ease-out" 
              />
              <PromptInput 
                onSubmit={onSubmit} 
                className="shadow-xl shadow-slate-900/5 border-slate-200 dark:border-slate-700 dark:shadow-slate-950/20 transition-all duration-300"
              >
                <PromptInputTextarea
                  value={input}
                  placeholder="Ask anything... (Shift + Enter for new line)"
                  onChange={handleInputChange}
                  className="text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4"
                />
                <PromptInputToolbar className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
                  <PromptInputTools>
                    <PromptInputModelSelect
                      onValueChange={(value) => setModel(value)}
                      value={model}
                    >
                      <PromptInputModelSelectTrigger className="cursor-pointer rounded-lg !rounded-bl-lg border border-slate-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-200">
                        <PromptInputModelSelectValue />
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent className="min-w-[250px] sm:min-w-[280px]">
                        {Object.entries(modelsByProvider).map(([provider, models]) => (
                          <PromptInputModelSelectGroup key={provider}>
                            <PromptInputModelSelectLabel>{provider}</PromptInputModelSelectLabel>
                            {models.map((model) => (
                              <PromptInputModelSelectItem key={model.id} value={model.id} className="cursor-pointer pl-6">
                                <span className="font-medium text-sm">{model.name}</span>
                              </PromptInputModelSelectItem>
                            ))}
                          </PromptInputModelSelectGroup>
                        ))}
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
                  </PromptInputTools>
                  <PromptInputSubmit
                    status={isLoading || isCreatingConversation ? 'streaming' : 'ready'}
                    disabled={!input?.trim() || isCreatingConversation}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                  />
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </div>
        ) : (
          // Conversation mode with messages and bottom prompt input
          <div className="flex-1 flex flex-col animate-in slide-in-from-top-4 duration-700 ease-out">
            {/* Loading indicator for messages */}
            {isLoadingMessages && (
              <div className="flex items-center justify-center py-4 border-b">
                <Loader />
                <span className="ml-2 text-sm text-muted-foreground">Loading conversation...</span>
              </div>
            )}

            <Conversation className="flex-1">
              <ConversationContent className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
                {messages.map((message) => (
                  <Message from={message.role} key={message.id} className="group">
                    <MessageContent className={`
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
                        : 'bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }
                      rounded-2xl px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 max-w-[95%] sm:max-w-[90%] lg:max-w-[85%] transition-colors duration-200
                    `}>
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{getMessageContent(message)}</div>
                      ) : (
                        <Response>{getMessageContent(message)}</Response>
                      )}
                    </MessageContent>
                  </Message>
                ))}
                
                {/* Loading indicator for streaming */}
                {isLoading && (
                  <Message from="assistant" className="group">
                    <MessageContent className="bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 max-w-[95%] sm:max-w-[90%] lg:max-w-[85%] transition-colors duration-200">
                      <Loader />
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Bottom prompt input */}
            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="p-3 sm:p-4 lg:p-6">
                <PromptInput 
                  onSubmit={onSubmit} 
                  className="shadow-xl shadow-slate-900/5 border-slate-200 dark:border-slate-700 dark:shadow-slate-950/20 transition-all duration-300"
                >
                  <PromptInputTextarea
                    value={input}
                    placeholder="Ask anything... (Shift + Enter for new line)"
                    onChange={handleInputChange}
                    className="text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4"
                  />
                  <PromptInputToolbar className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
                    <PromptInputTools>
                      <PromptInputModelSelect
                        onValueChange={(value) => setModel(value)}
                        value={model}
                      >
                        <PromptInputModelSelectTrigger className="cursor-pointer rounded-lg !rounded-bl-lg border border-slate-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-200">
                          <PromptInputModelSelectValue />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent className="min-w-[250px] sm:min-w-[280px]">
                          {Object.entries(modelsByProvider).map(([provider, models]) => (
                            <PromptInputModelSelectGroup key={provider}>
                              <PromptInputModelSelectLabel>{provider}</PromptInputModelSelectLabel>
                              {models.map((model) => (
                                <PromptInputModelSelectItem key={model.id} value={model.id} className="cursor-pointer pl-6">
                                  <span className="font-medium text-sm">{model.name}</span>
                                </PromptInputModelSelectItem>
                              ))}
                            </PromptInputModelSelectGroup>
                          ))}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    </PromptInputTools>
                    <PromptInputSubmit
                      status={isLoading || isCreatingConversation ? 'streaming' : 'ready'}
                      disabled={!input?.trim() || isCreatingConversation}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                    />
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
