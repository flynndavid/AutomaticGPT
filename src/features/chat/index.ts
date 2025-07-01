// Main Chat component
export { Chat } from './components/Chat';

// Individual components for advanced usage
export { ChatHeader } from './components/ChatHeader';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { InputBar } from './components/InputBar';
export { EmptyState } from './components/EmptyState';
export { Avatar } from './components/Avatar';
export { ConversationShareModal } from './components/ConversationShareModal';
export { AnalyticsDashboard } from './components/AnalyticsDashboard';

// Hooks
export { useChatController } from './hooks/useChatController';
export { useChatManager } from './hooks/useChatManager';
export { useConversations } from './hooks/useConversations';
export { useConversation } from './hooks/useConversation';
export { useConversationSharing } from './hooks/useConversationSharing';
export { useConversationAnalytics } from './hooks/useConversationAnalytics';

// Types
export type { ChatMessage, ChatRole, ToolInvocation, SuggestionCard } from './types';
