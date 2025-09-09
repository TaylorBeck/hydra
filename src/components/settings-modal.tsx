'use client';

import * as React from 'react';
import { Settings, Eye, EyeOff, Save, RotateCcw, Info } from 'lucide-react';
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
import { useSettings } from '@/hooks/use-settings';
import type { ApiKeys, ModelSettings } from '@/hooks/use-settings';
import { useAuthContext } from '@/components/auth/auth-provider';

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
  const [showApiKeys, setShowApiKeys] = React.useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = React.useState(false);
  
  const settings = useSettings();
  const { isAuthenticated } = useAuthContext();
  
  // Local settings state
  const [localSettings, setLocalSettings] = React.useState(settings);

  // Update local settings when hook settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    const newSettings = {
      ...localSettings,
      apiKeys: {
        ...localSettings.apiKeys,
        [provider]: value,
      },
    };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleModelSettingChange = (setting: keyof ModelSettings, value: string | number) => {
    const newSettings = {
      ...localSettings,
      modelSettings: {
        ...localSettings.modelSettings,
        [setting]: value,
      },
    };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('hydra-settings', JSON.stringify(localSettings));
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: localSettings }));
    setHasChanges(false);
    
    // TODO: If authenticated, also sync to Supabase
    if (isAuthenticated) {
      console.log('User is authenticated - settings could be synced to Supabase');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
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
    setLocalSettings(defaultSettings);
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
          
          {!isAuthenticated && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg w-fit pr-6">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  Your settings are only saved for this session. Sign in now to sync across devices.
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* API Keys Section */}
            <div className="px-2">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">API Keys</h3>
              <div className="space-y-4">
                {Object.entries(PROVIDER_LABELS).map(([provider, label]) => (
                  <div key={provider} className="space-y-3">
                    <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                      {label} API KeyDDD
                    </label>
                    <div className="relative mt-1">
                      <Input
                        type={showApiKeys[provider] ? 'text' : 'password'}
                        value={localSettings.apiKeys[provider as keyof ApiKeys]}
                        onChange={(e) => handleApiKeyChange(provider as keyof ApiKeys, e.target.value)}
                        placeholder={`Enter your ${label} API key`}
                        className="pr-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-11 focus-visible:ring-offset-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent focus-visible:ring-offset-1"
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
                    Temperature ({localSettings.modelSettings.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={localSettings.modelSettings.temperature}
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
                    value={localSettings.modelSettings.maxOutputTokens}
                    onChange={(e) => handleModelSettingChange('maxOutputTokens', parseInt(e.target.value) || 4096)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-11 focus-visible:ring-offset-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Top P ({localSettings.modelSettings.topP})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localSettings.modelSettings.topP}
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
                    value={localSettings.modelSettings.topK}
                    onChange={(e) => handleModelSettingChange('topK', parseInt(e.target.value) || 0)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-11 focus-visible:ring-offset-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Presence Penalty ({localSettings.modelSettings.presencePenalty})
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={localSettings.modelSettings.presencePenalty}
                    onChange={(e) => handleModelSettingChange('presencePenalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Frequency Penalty ({localSettings.modelSettings.frequencyPenalty})
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={localSettings.modelSettings.frequencyPenalty}
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
                    value={localSettings.modelSettings.maxRetries}
                    onChange={(e) => handleModelSettingChange('maxRetries', parseInt(e.target.value) || 2)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-11 focus-visible:ring-offset-1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Stop Sequences
                  </label>
                  <Textarea
                    value={localSettings.modelSettings.stopSequences}
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
            onClick={handleResetSettings}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-11"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex items-center gap-3">
            {!isAuthenticated && hasChanges && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Settings saved locally
              </p>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              <Save className="h-4 w-4 mr-2" />
              {isAuthenticated ? 'Save Settings' : 'Save Locally'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}