'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Eye, EyeOff, Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/components/auth/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Validation schema
const settingsSchema = z.object({
  apiKeys: z.object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    google: z.string().optional(),
    mistral: z.string().optional(),
    groq: z.string().optional(),
    xai: z.string().optional(),
    deepseek: z.string().optional(),
    cerebras: z.string().optional(),
    perplexity: z.string().optional(),
  }),
  modelSettings: z.object({
    temperature: z.number().min(0).max(2),
    maxOutputTokens: z.number().min(1).max(100000),
    topP: z.number().min(0).max(1),
    topK: z.number().min(0).max(100),
    presencePenalty: z.number().min(-2).max(2),
    frequencyPenalty: z.number().min(-2).max(2),
    maxRetries: z.number().min(0).max(10),
    stopSequences: z.string(),
  }),
  preferences: z.object({
    preferredModel: z.string(),
    theme: z.enum(['light', 'dark', 'system']),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: SettingsFormData = {
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
  preferences: {
    preferredModel: 'gpt-4o',
    theme: 'system',
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

// Fetch user settings
const fetchUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

// Update user settings
const updateUserSettings = async (userId: string, settings: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export function EnhancedSettingsModal() {
  const [open, setOpen] = React.useState(false);
  const [showApiKeys, setShowApiKeys] = React.useState<Record<string, boolean>>({});
  const [showFormAnyway, setShowFormAnyway] = React.useState(false);
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  // Fetch user settings
  const { data: userSettings, isLoading, error } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: () => fetchUserSettings(user!.id),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: SettingsFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Transform form data to database format
      const dbSettings = {
        // API Keys
        openai_api_key: settings.apiKeys.openai || null,
        anthropic_api_key: settings.apiKeys.anthropic || null,
        google_api_key: settings.apiKeys.google || null,
        mistral_api_key: settings.apiKeys.mistral || null,
        groq_api_key: settings.apiKeys.groq || null,
        xai_api_key: settings.apiKeys.xai || null,
        deepseek_api_key: settings.apiKeys.deepseek || null,
        cerebras_api_key: settings.apiKeys.cerebras || null,
        perplexity_api_key: settings.apiKeys.perplexity || null,
        
        // Model Settings
        default_temperature: settings.modelSettings.temperature,
        default_max_output_tokens: settings.modelSettings.maxOutputTokens,
        default_top_p: settings.modelSettings.topP,
        default_top_k: settings.modelSettings.topK,
        default_presence_penalty: settings.modelSettings.presencePenalty,
        default_frequency_penalty: settings.modelSettings.frequencyPenalty,
        default_max_retries: settings.modelSettings.maxRetries,
        default_stop_sequences: settings.modelSettings.stopSequences,
        
        // Preferences
        preferred_model: settings.preferences.preferredModel,
        theme: settings.preferences.theme,
      };
      
      return updateUserSettings(user.id, dbSettings);
    },
    onSuccess: () => {
      toast.success('Settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    },
  });

  // Reset to defaults
  const resetToDefaults = () => {
    reset(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults');
  };

  // Load user settings into form when data is available or on error
  React.useEffect(() => {
    if (userSettings) {
      const formData: SettingsFormData = {
        apiKeys: {
          openai: userSettings.openai_api_key || '',
          anthropic: userSettings.anthropic_api_key || '',
          google: userSettings.google_api_key || '',
          mistral: userSettings.mistral_api_key || '',
          groq: userSettings.groq_api_key || '',
          xai: userSettings.xai_api_key || '',
          deepseek: userSettings.deepseek_api_key || '',
          cerebras: userSettings.cerebras_api_key || '',
          perplexity: userSettings.perplexity_api_key || '',
        },
        modelSettings: {
          temperature: userSettings.default_temperature || 0.7,
          maxOutputTokens: userSettings.default_max_output_tokens || 4096,
          topP: userSettings.default_top_p || 1.0,
          topK: userSettings.default_top_k || 0,
          presencePenalty: userSettings.default_presence_penalty || 0,
          frequencyPenalty: userSettings.default_frequency_penalty || 0,
          maxRetries: userSettings.default_max_retries || 2,
          stopSequences: userSettings.default_stop_sequences || '',
        },
        preferences: {
          preferredModel: userSettings.preferred_model || 'gpt-4o',
          theme: (userSettings.theme as 'light' | 'dark' | 'system') || 'system',
        },
      };
      
      reset(formData);
    } else if (error) {
      // If there's an error loading settings, use defaults
      console.warn('Failed to load user settings, using defaults:', error);
      reset(DEFAULT_SETTINGS);
    }
  }, [userSettings, error, reset]);

  // Timeout to show form anyway after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !userSettings && !error) {
        setShowFormAnyway(true);
        reset(DEFAULT_SETTINGS);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading, userSettings, error, reset]);

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  const watchedTemperature = watch('modelSettings.temperature');
  const watchedTopP = watch('modelSettings.topP');
  const watchedPresencePenalty = watch('modelSettings.presencePenalty');
  const watchedFrequencyPenalty = watch('modelSettings.frequencyPenalty');

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              Please sign in to access your personalized settings and save your preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your settings will be synced across all your devices when you sign in.
            </p>
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" />
        <DialogContent className="max-w-2xl max-h-[85vh] h-[85vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 !flex !flex-col overflow-hidden !gap-0 animate-none data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out shadow-2xl shadow-slate-900/25 dark:shadow-slate-950/50 rounded-xl">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-slate-900 dark:text-slate-100">Settings</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Configure your API keys and model settings. Changes are automatically synced to your account.
          </DialogDescription>
        </DialogHeader>

        {isLoading && !error && !showFormAnyway ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {error && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Unable to load your saved settings. Using default values. You can still modify and save your settings.
                </p>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-1 min-h-0">
              <div className="space-y-6 py-2">
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
                            placeholder={`Enter your ${label} API key`}
                            className="pr-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            {...register(`apiKeys.${provider as keyof typeof PROVIDER_LABELS}`)}
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

                <Separator />

                {/* Model Settings Section */}
                <div className="px-2">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Model Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Temperature ({watchedTemperature?.toFixed(1)})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        {...register('modelSettings.temperature', { valueAsNumber: true })}
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
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        {...register('modelSettings.maxOutputTokens', { valueAsNumber: true })}
                      />
                      {errors.modelSettings?.maxOutputTokens && (
                        <p className="text-xs text-destructive">{errors.modelSettings.maxOutputTokens.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Top P ({watchedTopP?.toFixed(1)})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        {...register('modelSettings.topP', { valueAsNumber: true })}
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
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        {...register('modelSettings.topK', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Presence Penalty ({watchedPresencePenalty?.toFixed(1)})
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        {...register('modelSettings.presencePenalty', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Frequency Penalty ({watchedFrequencyPenalty?.toFixed(1)})
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        {...register('modelSettings.frequencyPenalty', { valueAsNumber: true })}
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
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        {...register('modelSettings.maxRetries', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Stop Sequences
                      </label>
                      <Textarea
                        placeholder="Enter stop sequences separated by commas"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        rows={2}
                        {...register('modelSettings.stopSequences')}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Comma-separated list of sequences where the model should stop generating
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={resetToDefaults}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || updateSettingsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </form>
        )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
