import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import {
  ChatRequestSchema,
  WeatherToolSchema,
  CelsiusConvertToolSchema,
  WeatherResultSchema,
  CelsiusConvertResultSchema,
} from '@/types/api';
import { db } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const validatedRequest = ChatRequestSchema.parse(requestBody);
    const { messages, conversationId, userId, saveMessages = true } = validatedRequest;

    console.log('post messages:', messages);
    console.log('conversation ID:', conversationId);
    console.log('user ID:', userId);

    // Save user message to database if persistence is enabled
    let userMessageId: string | null = null;
    if (saveMessages && conversationId && userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        try {
          const { data: messageData } = await db.createMessage({
            conversation_id: conversationId,
            content: lastMessage.content,
            role: lastMessage.role,
            metadata: {
              timestamp: new Date().toISOString(),
              client_id: lastMessage.id || randomUUID(),
            },
          });
          userMessageId = messageData?.id || null;
          console.log('Saved user message:', userMessageId);
        } catch (error) {
          console.error('Failed to save user message:', error);
        }
      }
    }

    // Track timing for assistant response
    const startTime = Date.now();

    const result = streamText({
      model: openai('gpt-4o'),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content || '',
        ...(msg.id && { id: msg.id }),
      })),
      tools: {
        // https://ai-sdk.dev/docs/getting-started/expo#enhance-your-chatbot-with-tools
        weather: tool({
          description: 'Get the weather in a location (fahrenheit)',
          parameters: WeatherToolSchema,
          async execute({ location }) {
            const temperature = Math.round(Math.random() * (90 - 32) + 32);
            const result = {
              location,
              temperature,
            };

            // Validate result against schema
            return WeatherResultSchema.parse(result);
          },
        }),

        convertFahrenheitToCelsius: tool({
          description: 'Convert a temperature in fahrenheit to celsius',
          parameters: CelsiusConvertToolSchema,
          async execute({ temperature }) {
            const celsius = Math.round((temperature - 32) * (5 / 9));
            const result = {
              temperature,
              celsius,
            };

            // Validate result against schema
            return CelsiusConvertResultSchema.parse(result);
          },
        }),
      },
      onFinish: async (completion) => {
        console.log('Stream finished');

        // Save assistant response to database
        if (saveMessages && conversationId && completion.text.trim()) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          try {
            const { data: assistantMessage } = await db.createMessage({
              conversation_id: conversationId,
              content: completion.text.trim(),
              role: 'assistant',
              metadata: {
                timestamp: new Date().toISOString(),
                response_time_ms: responseTime,
                user_message_id: userMessageId,
                finish_reason: completion.finishReason,
                usage: completion.usage,
              },
              model_used: 'gpt-4o',
              tokens_used: completion.usage?.totalTokens || null,
              response_time_ms: responseTime,
              tool_calls: completion.toolCalls || [],
              tool_results: completion.toolResults || [],
            });

            console.log('Saved assistant message:', assistantMessage?.id);

            // Auto-generate conversation title if this is the first user message
            if (messages.length <= 2) {
              // user message + assistant response
              try {
                const generatedTitle = await db.generateConversationTitle(conversationId);
                if (generatedTitle.data) {
                  await db.updateConversation(conversationId, { title: generatedTitle.data });
                  console.log('Updated conversation title:', generatedTitle.data);
                }
              } catch (titleError) {
                console.error('Failed to generate conversation title:', titleError);
              }
            }
          } catch (error) {
            console.error('Failed to save assistant message:', error);
          }
        }
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: __DEV__ ? errorHandler : undefined,
      headers: {
        // Issue with iOS NSURLSession that requires Content-Type set in order to enable streaming.
        // https://github.com/expo/expo/issues/32950#issuecomment-2508297646
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Invalid request format',
            type: 'validation_error',
            details: error.errors,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          message: 'Internal server error',
          type: 'server_error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Prevent cryptic errors in development.
// https://ai-sdk.dev/docs/troubleshooting/use-chat-an-error-occurred
function errorHandler(error: unknown): string {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
