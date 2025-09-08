'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { HydraLogo } from '@/components/hydra-logo';
import { EnhancedSettingsModal } from '@/components/settings/enhanced-settings-modal';
import { AuthButton } from '@/components/auth/auth-button';
import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';

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
  const [model] = useState(allModels[0].id);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80 transition-colors duration-300">
        <div className="mx-auto flex h-14 sm:h-16 max-w-full items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-1 sm:p-1.5 dark:from-slate-800 dark:to-slate-700 transition-all duration-300">
              <HydraLogo width={28} height={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hyra
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chat with multiple LLMs
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hyra
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 px-2 sm:px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="hidden sm:inline">{allModels.find(m => m.id === model)?.name || 'GPT-4o'}</span>
              <span className="sm:hidden">{allModels.find(m => m.id === model)?.provider || 'OpenAI'}</span>
            </div>
            <EnhancedSettingsModal />
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <EnhancedChatInterface />
      </div>
    </div>
  );
}
