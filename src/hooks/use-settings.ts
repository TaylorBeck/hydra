'use client';

import { useState, useEffect } from 'react';

interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  mistral: string;
  groq: string;
  xai: string;
  deepseek: string;
  cerebras: string;
  perplexity: string;
}

interface ModelSettings {
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxRetries: number;
  stopSequences: string;
}

interface Settings {
  apiKeys: ApiKeys;
  modelSettings: ModelSettings;
}

const DEFAULT_SETTINGS: Settings = {
  apiKeys: {
    openai: '',
    anthropic: '',
    google: '',
    mistral: '',
    groq: '',
    xai: '',
    deepseek: '',
    cerebras: '',
    perplexity: '',
  },
  modelSettings: {
    temperature: 0.7,
    maxOutputTokens: 4096,
    topP: 1.0,
    topK: 0,
    presencePenalty: 0,
    frequencyPenalty: 0,
    maxRetries: 2,
    stopSequences: '',
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('hydra-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('settings-updated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  return settings;
}

export type { Settings, ApiKeys, ModelSettings };
