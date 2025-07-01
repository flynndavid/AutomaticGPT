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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log('post messages:', messages);

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
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
