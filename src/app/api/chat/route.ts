import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  mistral?: string;
}

interface ModelSettings {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxRetries?: number;
  stopSequences?: string;
}

function getModelProvider(modelId: string, apiKeys: ApiKeys = {}) {
  // Create providers with custom API keys if provided
  const openai = createOpenAI({
    apiKey: apiKeys.openai || process.env.OPENAI_API_KEY,
  });
  
  const anthropic = createAnthropic({
    apiKey: apiKeys.anthropic || process.env.ANTHROPIC_API_KEY,
  });
  
  const google = createGoogleGenerativeAI({
    apiKey: apiKeys.google || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  
  const mistral = createMistral({
    apiKey: apiKeys.mistral || process.env.MISTRAL_API_KEY,
  });

  // OpenAI models
  if (modelId.startsWith('gpt-')) {
    return openai(modelId);
  }
  
  // Anthropic models
  if (modelId.startsWith('claude-')) {
    return anthropic(modelId);
  }
  
  // Google models
  if (modelId.startsWith('gemini-')) {
    return google(modelId);
  }
  
  // Mistral models
  if (modelId.startsWith('mistral-') || modelId.startsWith('pixtral-')) {
    return mistral(modelId);
  }
  
  // Default to OpenAI GPT-4o
  return openai('gpt-4o');
}

export async function POST(req: Request) {
  const requestBody = await req.json();
  console.log('API Route received:', requestBody);
  
  const { 
    messages, 
    model, 
    apiKeys, 
    modelSettings 
  }: { 
    messages: UIMessage[]; 
    model?: string;
    apiKeys?: ApiKeys;
    modelSettings?: ModelSettings;
  } = requestBody;

  // Parse stop sequences if provided
  const stopSequences = modelSettings?.stopSequences 
    ? modelSettings.stopSequences.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : undefined;

  const result = streamText({
    model: getModelProvider(model || 'gpt-4o', apiKeys),
    messages: convertToModelMessages(messages),
    temperature: modelSettings?.temperature,
    maxOutputTokens: modelSettings?.maxOutputTokens,
    topP: modelSettings?.topP,
    topK: modelSettings?.topK,
    presencePenalty: modelSettings?.presencePenalty,
    frequencyPenalty: modelSettings?.frequencyPenalty,
    maxRetries: modelSettings?.maxRetries,
    stopSequences,
  });

  return result.toUIMessageStreamResponse();
}
