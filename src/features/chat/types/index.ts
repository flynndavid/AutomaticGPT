import { UIMessage } from 'ai';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage extends UIMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: Date;
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
