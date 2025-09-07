'use client';

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
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { Loader } from '@/components/ai-elements/loader';
import { ThemeToggle } from '@/components/theme-toggle';
import { HydraLogo } from '@/components/hydra-logo';

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

export default function Chat() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState(allModels[0].id);
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        }
      );
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-1.5 dark:from-slate-800 dark:to-slate-700 transition-all duration-300">
              <HydraLogo width={32} height={32} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hydra
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chat with multiple LLMs
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Hydra
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 px-2 sm:px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="hidden sm:inline">{allModels.find(m => m.id === model)?.name || 'GPT-4o'}</span>
              <span className="sm:hidden !ml-2">{allModels.find(m => m.id === model)?.provider || 'OpenAI'}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex h-[calc(100vh-4rem-1rem)] sm:h-[calc(100vh-4rem-1.5rem)] flex-col">
          <Conversation className="h-full">
            <ConversationContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <div className="mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-4 sm:p-6 dark:from-slate-800 dark:to-slate-700 shadow-lg transition-all duration-300">
                    <HydraLogo width={40} height={40} className="sm:w-12 sm:h-12" />
                  </div>
                  <h2 className="mb-2 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Welcome to Hydra
                  </h2>
                  <p className="mb-6 sm:mb-8 max-w-sm sm:max-w-md text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Choose from multiple AI models and start a conversation. Switch between models anytime to get different perspectives.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm w-full max-w-md sm:max-w-none">
                    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-slate-800 transition-colors duration-200">
                      <div className="mb-1 sm:mb-2 font-medium text-slate-900 dark:text-slate-100">OpenAI</div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">GPT-4o, GPT-4o Mini</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-slate-800 transition-colors duration-200">
                      <div className="mb-1 sm:mb-2 font-medium text-slate-900 dark:text-slate-100">Anthropic</div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Claude 3.5 Sonnet</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-slate-800 transition-colors duration-200">
                      <div className="mb-1 sm:mb-2 font-medium text-slate-900 dark:text-slate-100">Google</div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Gemini 1.5 Pro</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-slate-800 transition-colors duration-200">
                      <div className="mb-1 sm:mb-2 font-medium text-slate-900 dark:text-slate-100">Mistral</div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Mistral Large</div>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <Message from={message.role} key={message.id} className="group">
                  <MessageContent className={`
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
                      : 'bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                    }
                    rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-[90%] sm:max-w-[85%] transition-colors duration-200
                  `}>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}
              {status === 'submitted' && (
                <Message from="assistant" className="group">
                  <MessageContent className="bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-[90%] sm:max-w-[85%] transition-colors duration-200">
                    <Loader />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="mt-4 sm:mt-6">
            <PromptInput onSubmit={handleSubmit} className="shadow-xl shadow-slate-900/5 border-slate-200 dark:border-slate-700 dark:shadow-slate-950/20 transition-all duration-300">
              <PromptInputTextarea
                value={input}
                placeholder="Ask anything... (Shift + Enter for new line)"
                onChange={(e) => setInput(e.currentTarget.value)}
                className="text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4"
              />
              <PromptInputToolbar className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
                <PromptInputTools>
                  <PromptInputModelSelect
                    onValueChange={(value) => setModel(value)}
                    value={model}
                  >
                    <PromptInputModelSelectTrigger className="rounded-lg border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-200">
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
                  status={status === 'streaming' ? 'streaming' : 'ready'}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
