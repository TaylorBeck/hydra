import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function getModelProvider(modelId: string) {
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
  const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json();

  const result = streamText({
    model: getModelProvider(model || 'gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
