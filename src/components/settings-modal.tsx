'use client';

import * as React from 'react';
import { Settings, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  mistral: 'Mistral',
  groq: 'Groq',
  xai: 'xAI',
  deepseek: 'DeepSeek',
  cerebras: 'Cerebras',
  perplexity: 'Perplexity',
};

export function SettingsModal() {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [showApiKeys, setShowApiKeys] = React.useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('hydra-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleModelSettingChange = (setting: keyof ModelSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      modelSettings: {
        ...prev.modelSettings,
        [setting]: value,
      },
    }));
    setHasChanges(true);
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('hydra-settings', JSON.stringify(settings));
    setHasChanges(false);
    
    // Dispatch a custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">Settings</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Configure API keys and model settings for your AI providers.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* API Keys Section */}
            <div className="px-2">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">API Keys</h3>
              <div className="space-y-4">
                {Object.entries(PROVIDER_LABELS).map(([provider, label]) => (
                  <div key={provider} className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {label} API Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showApiKeys[provider] ? 'text' : 'password'}
                        value={settings.apiKeys[provider as keyof ApiKeys]}
                        onChange={(e) => handleApiKeyChange(provider as keyof ApiKeys, e.target.value)}
                        placeholder={`Enter your ${label} API key`}
                        className="pr-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility(provider)}
                      >
                        {showApiKeys[provider] ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Settings Section */}
            <div className="px-2">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Model Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Temperature ({settings.modelSettings.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.modelSettings.temperature}
                    onChange={(e) => handleModelSettingChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Max Output Tokens
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100000"
                    value={settings.modelSettings.maxOutputTokens}
                    onChange={(e) => handleModelSettingChange('maxOutputTokens', parseInt(e.target.value) || 4096)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Top P ({settings.modelSettings.topP})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.modelSettings.topP}
                    onChange={(e) => handleModelSettingChange('topP', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nucleus sampling. Controls diversity of responses
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Top K
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.modelSettings.topK}
                    onChange={(e) => handleModelSettingChange('topK', parseInt(e.target.value) || 0)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Presence Penalty ({settings.modelSettings.presencePenalty})
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={settings.modelSettings.presencePenalty}
                    onChange={(e) => handleModelSettingChange('presencePenalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Frequency Penalty ({settings.modelSettings.frequencyPenalty})
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={settings.modelSettings.frequencyPenalty}
                    onChange={(e) => handleModelSettingChange('frequencyPenalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Max Retries
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={settings.modelSettings.maxRetries}
                    onChange={(e) => handleModelSettingChange('maxRetries', parseInt(e.target.value) || 2)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Stop Sequences
                  </label>
                  <Textarea
                    value={settings.modelSettings.stopSequences}
                    onChange={(e) => handleModelSettingChange('stopSequences', e.target.value)}
                    placeholder="Enter stop sequences separated by commas"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    rows={2}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comma-separated list of sequences where the model should stop generating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
