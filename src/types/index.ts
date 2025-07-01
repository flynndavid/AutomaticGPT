// Global domain types for the application

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  toolInvocations?: ToolInvocation[];
}

export interface ToolInvocation {
  toolName: string;
  state: 'pending' | 'result' | 'error';
  args?: Record<string, unknown>;
  result?: unknown;
  error?: Error;
}

export interface SuggestionCard {
  id: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

// Weather tool specific types
export interface WeatherResult {
  location: string;
  temperature: number;
}

export interface CelsiusConvertResult {
  temperature: number;
  celsius: number;
}

// Generic tool result types
export type ToolResult = WeatherResult | CelsiusConvertResult | Record<string, unknown>;

// Error handling types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
