# AI Conversation System Documentation

A comprehensive conversation management system for AI chat applications built with React Native, Expo, and Supabase.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [React Hooks](#react-hooks)
- [Components](#components)
- [Features](#features)
- [Setup & Migration](#setup--migration)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Performance Considerations](#performance-considerations)

## Overview

The AI Conversation System provides persistent, scalable conversation management with advanced features including:

- **Persistent Message Storage**: All conversations and messages stored in Supabase
- **Real-time Streaming**: Maintains AI SDK streaming while persisting to database
- **Advanced Analytics**: Comprehensive usage metrics and conversation insights
- **Conversation Sharing**: Share conversations publicly or with specific users
- **Metadata Tracking**: Rich metadata for AI responses (tokens, response time, models, tools)
- **Archive System**: 7-day archive with automatic cleanup
- **Auto-titling**: Intelligent conversation titles from first message
- **Tool Call Tracking**: Full support for AI tool usage monitoring

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   Supabase DB    │    │   AI Provider   │
│   Components    │◄──►│   (PostgreSQL)   │    │   (OpenAI/etc)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Custom Hooks   │    │   RLS Policies   │    │  Streaming API  │
│  State Mgmt     │    │   Data Security  │    │  Message Persist│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Database, API, hooks, and UI components are cleanly separated
2. **Real-time Streaming**: AI responses stream in real-time while being persisted
3. **Security First**: Row Level Security ensures users only access their data
4. **Scalable Analytics**: Efficient data structures for analytics without performance impact
5. **Future-ready**: Designed for advanced AI features (memory, tools, generative UI)

## Database Schema

### Core Tables

#### `conversations`

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status conversation_status NOT NULL DEFAULT 'active',
    is_shared BOOLEAN NOT NULL DEFAULT false,
    share_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
```

#### `messages`

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role message_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',

    -- AI-specific tracking
    model_used TEXT,
    tokens_used INTEGER,
    response_time_ms INTEGER,
    tool_calls JSONB DEFAULT '[]',
    tool_results JSONB DEFAULT '[]',

    -- Content versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_message_id UUID REFERENCES messages(id)
);
```

#### `conversation_shares`

```sql
CREATE TABLE conversation_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions TEXT[] NOT NULL DEFAULT ARRAY['read'],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Views

#### `conversation_summaries`

Optimized view for conversation lists with message counts and previews.

#### `shared_conversations`

View for managing shared conversations with permission details.

### Enums

- `message_role`: 'user', 'assistant', 'system', 'tool'
- `conversation_status`: 'active', 'archived', 'shared'

## API Reference

### Chat API Endpoint

**POST** `/api/chat`

#### Request Body

```typescript
{
  messages: ChatMessage[];
  conversationId?: string;
  userId?: string;
  saveMessages?: boolean;
  temperature?: number;
  maxTokens?: number;
}
```

#### Features

- **Automatic Persistence**: User and assistant messages automatically saved
- **Metadata Tracking**: Captures tokens, response time, model used, tool calls
- **Auto-titling**: Generates conversation titles from first user message
- **Streaming Support**: Maintains real-time streaming while persisting

#### Response

Streaming response compatible with AI SDK with automatic persistence callbacks.

## React Hooks

### Core Hooks

#### `useChatManager()`

High-level hook for complete chat functionality.

```typescript
const {
  messages,
  input,
  isLoading,
  currentConversationId,
  handleInputChange,
  onSend,
  handleConversationSelect,
  handleNewConversation,
} = useChatManager();
```

#### `useConversations()`

Manages conversation list and CRUD operations.

```typescript
const {
  conversations,
  loading,
  error,
  createConversation,
  deleteConversation,
  archiveConversation,
  updateConversationTitle,
} = useConversations();
```

#### `useConversation(conversationId)`

Manages individual conversation state and messages.

```typescript
const { conversation, messages, loading, addMessage, updateMessage, deleteMessage, generateTitle } =
  useConversation(conversationId);
```

#### `useConversationSharing()`

Handles conversation sharing functionality.

```typescript
const { shareConversation, getSharedConversations, removeShare, generateShareLink } =
  useConversationSharing();
```

#### `useConversationAnalytics()`

Provides comprehensive analytics and insights.

```typescript
const { stats, analytics, loading, refreshStats, exportData } = useConversationAnalytics();
```

### Hook Integration Pattern

```typescript
// High-level pattern for complete chat functionality
function ChatScreen() {
  const chatManager = useChatManager();

  return (
    <Chat {...chatManager} />
  );
}

// Granular pattern for custom implementations
function CustomChatScreen() {
  const [conversationId, setConversationId] = useState(null);
  const conversations = useConversations();
  const chat = useChatController({ conversationId });
  const sharing = useConversationSharing();

  // Custom implementation...
}
```

## Components

### Core Components

#### `<Chat />`

Main chat interface with integrated conversation management.

```typescript
<Chat />
```

#### `<Sidebar />`

Enhanced sidebar with conversation history, sharing, and analytics.

```typescript
<Sidebar
  isOpen={sidebarOpen}
  onClose={closeSidebar}
  onConversationSelect={handleConversationSelect}
  currentConversationId={currentConversationId}
/>
```

#### `<ConversationShareModal />`

Modal for sharing conversations with users or publicly.

```typescript
<ConversationShareModal
  visible={showShareModal}
  onClose={() => setShowShareModal(false)}
  conversationId={conversationId}
  conversationTitle={conversationTitle}
/>
```

#### `<AnalyticsDashboard />`

Comprehensive analytics dashboard with charts and insights.

```typescript
<AnalyticsDashboard
  visible={showAnalytics}
  onClose={() => setShowAnalytics(false)}
/>
```

### Component Architecture

```
<Chat>
  ├── <ChatHeader>
  ├── <MessageList>
  │   └── <MessageBubble>
  ├── <EmptyState>
  ├── <InputBar>
  └── <Sidebar>
      ├── Navigation
      ├── Conversation List
      ├── <ConversationShareModal>
      └── <AnalyticsDashboard>
```

## Features

### Message Persistence

Every message is automatically saved with rich metadata:

```typescript
{
  id: "uuid",
  conversation_id: "uuid",
  content: "Hello, how can I help?",
  role: "assistant",
  created_at: "2024-01-01T12:00:00Z",
  metadata: {
    timestamp: "2024-01-01T12:00:00Z",
    response_time_ms: 1250,
    finish_reason: "stop",
    usage: { total_tokens: 150 }
  },
  model_used: "gpt-4o",
  tokens_used: 150,
  response_time_ms: 1250,
  tool_calls: [],
  tool_results: []
}
```

### Conversation Sharing

Share conversations with fine-grained permissions:

- **Public sharing**: Generate shareable links with expiration
- **User-specific sharing**: Share with specific users by email
- **Permission control**: Read-only or read-write access
- **Expiration dates**: Set custom expiration times

### Advanced Analytics

Comprehensive analytics including:

- **Usage Metrics**: Total conversations, messages, tokens
- **Performance Data**: Average response times, model usage
- **Tool Analytics**: Tool usage frequency and success rates
- **Time-based Insights**: Daily/weekly activity patterns
- **Export Capabilities**: JSON and CSV export for external analysis

### Auto-Archive System

- **7-day Grace Period**: Archived conversations remain accessible for 7 days
- **Automatic Cleanup**: Permanently delete after grace period
- **Restore Capability**: Users can restore archived conversations
- **Bulk Operations**: Archive multiple conversations

## Setup & Migration

### 1. Database Migration

Apply the conversation system migration:

```bash
# Using Supabase CLI
supabase migration up

# Or using the MCP tool (recommended)
# Migration is automatically applied via Supabase MCP integration
```

### 2. Environment Variables

Required environment variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider (OpenAI example)
OPENAI_API_KEY=your_openai_api_key

# Optional: App URL for sharing
EXPO_PUBLIC_APP_URL=https://your-app.com
```

### 3. MCP Configuration (Optional)

For TaskMaster integration, add to `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "--package=@supabase/mcp-server", "supabase-mcp"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
      }
    }
  }
}
```

### 4. Authentication Setup

Ensure Supabase Auth is configured:

```typescript
// This is already set up in your existing auth system
import { useAuth } from '@/features/auth/hooks/useAuth';

function App() {
  const { user } = useAuth();

  // Conversation system automatically uses authenticated user
  return <Chat />;
}
```

## Usage Examples

### Basic Chat Implementation

```typescript
import { Chat } from '@/features/chat';

function ChatScreen() {
  return <Chat />;
}
```

### Custom Chat with Conversation Management

```typescript
import { useChatManager, Sidebar, useSidebar } from '@/features/chat';

function CustomChatScreen() {
  const {
    messages,
    input,
    isLoading,
    currentConversationId,
    handleInputChange,
    onSend,
    handleConversationSelect,
  } = useChatManager();

  const sidebar = useSidebar();

  return (
    <View style={{ flex: 1 }}>
      {/* Chat Interface */}
      <ChatHeader onMenuPress={sidebar.open} />
      <MessageList messages={messages} isLoading={isLoading} />
      <InputBar
        input={input}
        onInputChange={handleInputChange}
        onSend={onSend}
        isLoading={isLoading}
      />

      {/* Sidebar with Conversation Management */}
      <Sidebar
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        onConversationSelect={handleConversationSelect}
        currentConversationId={currentConversationId}
      />
    </View>
  );
}
```

### Analytics Integration

```typescript
import { useConversationAnalytics } from '@/features/chat';

function AnalyticsScreen() {
  const { stats, analytics, loading } = useConversationAnalytics();

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView>
      <Text>Total Conversations: {stats?.totalConversations}</Text>
      <Text>Total Messages: {stats?.totalMessages}</Text>
      <Text>Tokens Used: {stats?.totalTokensUsed}</Text>

      {/* Render analytics charts */}
      {analytics.map(conv => (
        <ConversationAnalyticsCard key={conv.id} analytics={conv} />
      ))}
    </ScrollView>
  );
}
```

### Conversation Sharing

```typescript
import { useConversationSharing } from '@/features/chat';

function ShareConversation({ conversationId }: { conversationId: string }) {
  const { shareConversation, generateShareLink } = useConversationSharing();

  const handleShare = async () => {
    // Share publicly with 7-day expiration
    const shareLink = await generateShareLink(conversationId, 7);

    // Or share with specific user
    await shareConversation({
      conversationId,
      sharedWith: 'user@example.com',
      permissions: ['read'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  return (
    <Button title="Share Conversation" onPress={handleShare} />
  );
}
```

## Advanced Features

### Tool Call Tracking

The system automatically tracks AI tool usage:

```typescript
// Tool calls are automatically captured in message metadata
{
  tool_calls: [
    {
      function: { name: "weather", arguments: { location: "NYC" } },
      type: "function"
    }
  ],
  tool_results: [
    {
      function: "weather",
      result: { temperature: 72, condition: "sunny" }
    }
  ]
}
```

### Custom Metadata

Add custom metadata to messages:

```typescript
const { addMessage } = useConversation(conversationId);

await addMessage('Hello!', 'user', {
  customData: { source: 'mobile_app', version: '1.0' },
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
});
```

### Conversation Search

Implement conversation search using Supabase full-text search:

```sql
-- Add search capability to conversations
ALTER TABLE conversations ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION update_conversation_search()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_search_trigger
  BEFORE INSERT OR UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_conversation_search();
```

### Real-time Subscriptions

Add real-time updates for conversation lists:

```typescript
import { realtime } from '@/lib/supabase';

function useRealtimeConversations(userId: string) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const subscription = realtime.subscribeToProfile(userId, (payload) => {
      // Handle real-time conversation updates
      console.log('Conversation updated:', payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return conversations;
}
```

## Troubleshooting

### Common Issues

#### 1. Messages Not Persisting

**Problem**: Messages appear in UI but don't save to database.

**Solutions**:

- Check Supabase connection and credentials
- Verify RLS policies allow user to insert messages
- Check console for API errors
- Ensure `saveMessages: true` in chat request

```typescript
// Debug message persistence
const { addMessage } = useConversation(conversationId);

try {
  const message = await addMessage('Test', 'user');
  console.log('Message saved:', message);
} catch (error) {
  console.error('Failed to save message:', error);
}
```

#### 2. Conversation Loading Issues

**Problem**: Conversations don't load or show empty state.

**Solutions**:

- Verify user authentication
- Check RLS policies on conversations table
- Ensure conversation_summaries view exists
- Check network connectivity

```typescript
// Debug conversation loading
const { conversations, loading, error } = useConversations();

console.log('Conversations:', conversations);
console.log('Loading:', loading);
console.log('Error:', error);
```

#### 3. Sharing Not Working

**Problem**: Conversation sharing fails or links don't work.

**Solutions**:

- Verify conversation_shares table exists
- Check sharing permissions in RLS policies
- Ensure share tokens are unique
- Validate expiration dates

#### 4. Analytics Performance

**Problem**: Analytics dashboard loads slowly or times out.

**Solutions**:

- Implement pagination for large datasets
- Add database indexes for common queries
- Use database views for complex aggregations
- Consider caching analytics data

### Performance Optimization

#### Database Indexes

Ensure these indexes exist for optimal performance:

```sql
-- Conversation queries
CREATE INDEX CONCURRENTLY idx_conversations_user_updated
ON conversations(user_id, updated_at DESC);

-- Message queries
CREATE INDEX CONCURRENTLY idx_messages_conversation_created
ON messages(conversation_id, created_at ASC);

-- Analytics queries
CREATE INDEX CONCURRENTLY idx_messages_created_tokens
ON messages(created_at, tokens_used) WHERE tokens_used IS NOT NULL;
```

#### Query Optimization

Use database views for complex analytics:

```sql
-- Pre-computed conversation statistics
CREATE MATERIALIZED VIEW conversation_stats AS
SELECT
  c.user_id,
  COUNT(*) as total_conversations,
  SUM(m.message_count) as total_messages,
  SUM(m.total_tokens) as total_tokens
FROM conversations c
LEFT JOIN (
  SELECT
    conversation_id,
    COUNT(*) as message_count,
    SUM(tokens_used) as total_tokens
  FROM messages
  GROUP BY conversation_id
) m ON c.id = m.conversation_id
GROUP BY c.user_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW conversation_stats;
```

## Performance Considerations

### Database Performance

1. **Indexing Strategy**
   - Primary indexes on foreign keys and frequently queried columns
   - Composite indexes for common query patterns
   - Partial indexes for filtered queries

2. **Query Optimization**
   - Use database views for complex aggregations
   - Implement pagination for large result sets
   - Consider materialized views for expensive analytics

3. **Connection Management**
   - Use connection pooling in production
   - Implement proper connection cleanup
   - Monitor connection limits

### Frontend Performance

1. **State Management**
   - Implement proper memoization in React hooks
   - Use optimistic updates for better UX
   - Batch multiple updates where possible

2. **Component Optimization**
   - Virtualize long conversation lists
   - Implement lazy loading for analytics
   - Use React.memo for expensive components

3. **Memory Management**
   - Clean up subscriptions in useEffect cleanup
   - Implement conversation list pagination
   - Clear unused conversation data

### Scaling Considerations

1. **Horizontal Scaling**
   - Database read replicas for analytics
   - CDN for static assets
   - Load balancing for API endpoints

2. **Data Archival**
   - Implement data retention policies
   - Archive old conversations to cold storage
   - Compress historical data

3. **Monitoring**
   - Database query performance monitoring
   - API response time tracking
   - User engagement analytics

---

## File Structure Reference

```
src/
├── features/chat/
│   ├── components/
│   │   ├── Chat.tsx                     # Main chat interface
│   │   ├── ConversationShareModal.tsx   # Sharing modal
│   │   ├── AnalyticsDashboard.tsx       # Analytics dashboard
│   │   └── ...
│   ├── hooks/
│   │   ├── useChatManager.ts            # High-level chat management
│   │   ├── useConversations.ts          # Conversation CRUD
│   │   ├── useConversation.ts           # Individual conversation
│   │   ├── useConversationSharing.ts    # Sharing functionality
│   │   ├── useConversationAnalytics.ts  # Analytics and insights
│   │   └── ...
│   └── index.ts                         # Exports
├── lib/
│   └── supabase.ts                      # Database client & helpers
├── types/
│   └── api.ts                           # API type definitions
└── app/api/
    └── chat+api.ts                      # Chat API endpoint

supabase/
└── migrations/
    └── 001_create_conversations_system.sql
```

This documentation provides a complete reference for developers working with the AI Conversation System. For additional support or feature requests, refer to the project's issue tracker or documentation updates.
