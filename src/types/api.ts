import { z } from 'zod';

// Chat API request/response schemas - compatible with AI SDK
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  id: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional().default(true),
});

export const ChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: ChatMessageSchema,
      finish_reason: z.enum(['stop', 'length', 'function_call', 'tool_calls']).nullable(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

// Tool schemas
export const WeatherToolSchema = z.object({
  location: z.string().describe('The location to get the weather for'),
});

export const CelsiusConvertToolSchema = z.object({
  temperature: z.number().describe('The temperature in fahrenheit to convert'),
});

export const WeatherResultSchema = z.object({
  location: z.string(),
  temperature: z.number(),
});

export const CelsiusConvertResultSchema = z.object({
  temperature: z.number(),
  celsius: z.number(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    code: z.string().optional(),
  }),
});

// Inferred types from schemas
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type WeatherToolParams = z.infer<typeof WeatherToolSchema>;
export type CelsiusConvertToolParams = z.infer<typeof CelsiusConvertToolSchema>;
export type WeatherResult = z.infer<typeof WeatherResultSchema>;
export type CelsiusConvertResult = z.infer<typeof CelsiusConvertResultSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// API endpoint types
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  requestSchema?: z.ZodSchema;
  responseSchema?: z.ZodSchema;
}

export const API_ENDPOINTS = {
  CHAT: {
    method: 'POST' as const,
    path: '/api/chat',
    requestSchema: ChatRequestSchema,
    responseSchema: ChatResponseSchema,
  },
} as const;
