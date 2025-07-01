# 🤖 AI Chat Feature

## 🎯 Overview

The AI Chat feature provides a full-featured chat interface powered by OpenAI's GPT models. It includes streaming responses, message history, markdown rendering, and a modern, responsive UI that works seamlessly across iOS, Android, and Web platforms.

**Status:** ✅ Ready

## ⚡ Quick Start

```bash
# Add your OpenAI API key to .env.local
OPENAI_API_KEY=sk-your-openai-api-key-here

# The chat is automatically available on the home screen
npm run start
```

## 🔧 Configuration

### Environment Variables

| Variable                          | Required | Default | Description                         |
| --------------------------------- | -------- | ------- | ----------------------------------- |
| `OPENAI_API_KEY`                  | ✅       | -       | Your OpenAI API key for GPT access  |
| `EXPO_PUBLIC_MAX_MESSAGES`        | ❌       | `100`   | Maximum messages to keep in history |
| `EXPO_PUBLIC_DEFAULT_TEMPERATURE` | ❌       | `0.7`   | AI response creativity (0-2)        |
| `EXPO_PUBLIC_MAX_TOKENS`          | ❌       | `2000`  | Maximum tokens per response         |
| `EXPO_PUBLIC_STREAMING_ENABLED`   | ❌       | `true`  | Enable streaming responses          |

### Feature Dependencies

```bash
# No dependencies - works independently
# Optional: Enable theming for better visual integration
EXPO_PUBLIC_ENABLE_DARK_MODE=true
```

## ✨ Features

- ✅ **Streaming Responses** - Real-time message streaming from OpenAI
- ✅ **Message History** - Persistent conversation history
- ✅ **Markdown Rendering** - Rich text formatting in messages
- ✅ **Virtualized List** - Smooth performance with large message lists
- ✅ **Dark/Light Theme** - Integrated with app theming system
- ✅ **Error Handling** - Graceful error states and retry options
- ✅ **Loading States** - Visual feedback during message generation
- ✅ **Responsive Design** - Works on mobile and web
- ✅ **Haptic Feedback** - Touch feedback on interactions
- ✅ **Auto-scroll** - Smart scrolling to latest messages

## 📝 Usage

### Basic Chat Interface

The chat interface is automatically rendered on the home screen and provides an intuitive messaging experience:

```typescript
// Main chat component usage (already implemented)
import { Chat } from '@/features/chat';

export default function HomeScreen() {
  return <Chat />;
}
```

### Custom Chat Implementation

```typescript
import { useChatController } from '@/features/chat';

export default function CustomChatComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChatController();

  return (
    <View className="flex-1">
      {/* Your custom chat UI */}
      <FlatList data={messages} renderItem={/* custom message renderer */} />
      <TextInput
        value={input}
        onChangeText={handleInputChange}
        onSubmitEditing={handleSubmit}
      />
    </View>
  );
}
```

### Advanced Configuration

```typescript
// Customize chat behavior
import { useChatController } from '@/features/chat';

const customConfig = {
  maxTokens: 1500,
  temperature: 0.9,
  model: 'gpt-4',
};

export default function CustomChat() {
  const chat = useChatController({
    api: '/api/chat',
    initialMessages: [
      { role: 'system', content: 'You are a helpful assistant.' }
    ],
  });

  return <Chat controller={chat} />;
}
```

## 🎨 Customization

### Styling

The chat interface uses NativeWind (Tailwind) classes and integrates with the app's theming system:

```typescript
// Customize message bubble appearance
const customBubbleStyles = {
  user: 'bg-blue-500 ml-8',
  assistant: 'bg-gray-100 dark:bg-gray-800 mr-8',
};
```

### Theming

```typescript
// Integrated with app theme system
import { useTheme } from '@/features/shared';

const ChatComponent = () => {
  const { colors, isDark } = useTheme();

  const bubbleStyle = isDark
    ? 'bg-gray-800 text-white'
    : 'bg-gray-100 text-black';

  return <MessageBubble className={bubbleStyle} />;
};
```

## 🔌 API Reference

### Hooks

#### `useChatController(options?)`

**Parameters:**

- `options.api` (optional): Custom API endpoint (default: '/api/chat')
- `options.initialMessages` (optional): Starting messages
- `options.headers` (optional): Custom headers

**Returns:**

- `messages`: Array of chat messages
- `input`: Current input text
- `isLoading`: Loading state for responses
- `error`: Error state if request fails
- `handleInputChange`: Function to update input
- `handleSubmit`: Function to send message
- `append`: Function to add message programmatically
- `reload`: Function to regenerate last response
- `stop`: Function to stop streaming response

### Components

#### `<Chat />`

Main chat interface component with complete functionality.

**Props:** None (uses internal state management)

#### `<MessageBubble message={message} isUser={boolean} />`

Individual message display component.

**Props:**

- `message` (required): Message object with content and role
- `isUser` (required): Whether message is from user or assistant

#### `<MessageList messages={messages} />`

Virtualized message list with performance optimizations.

**Props:**

- `messages` (required): Array of message objects

#### `<InputBar onSubmit={handleSubmit} />`

Text input with send button and voice input support.

**Props:**

- `onSubmit` (required): Function called when message is sent
- `value` (optional): Controlled input value
- `onChange` (optional): Input change handler

## 🚨 Troubleshooting

### Common Issues

**Issue: "OpenAI API key not found"**

```bash
# Solution: Add API key to environment
echo 'OPENAI_API_KEY=sk-your-key-here' >> .env.local
npm run start  # Restart development server
```

**Issue: Messages not streaming**

```bash
# Check streaming configuration
EXPO_PUBLIC_STREAMING_ENABLED=true

# Verify API endpoint
curl -X POST http://localhost:8081/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

**Issue: Poor performance with many messages**

```bash
# Reduce message history limit
EXPO_PUBLIC_MAX_MESSAGES=50

# Or clear message history
# (messages are stored in component state, restart app)
```

### Error Messages

| Error                 | Cause                 | Solution                                          |
| --------------------- | --------------------- | ------------------------------------------------- |
| "Unauthorized"        | Invalid API key       | Check OpenAI API key format and permissions       |
| "Rate limit exceeded" | Too many API requests | Wait or upgrade OpenAI plan                       |
| "Network error"       | Connection issues     | Check internet connection and API status          |
| "Invalid model"       | Unsupported model     | Use supported OpenAI model (gpt-3.5-turbo, gpt-4) |

## 📚 Related Documentation

- [Setup Guide](../../../SETUP.md) - Initial project setup
- [Features Overview](../../../FEATURES.md) - All available features
- [Theming](../theming/README.md) - Dark mode and theme customization
- [API Documentation](../../api/chat.md) - Detailed API reference

## 🤝 Contributing

To improve the chat feature:

1. 📖 Read the implementation in [`src/features/chat/`](../../../src/features/chat/)
2. 🔧 Make your changes
3. 📝 Update this documentation
4. ✅ Test on iOS, Android, and Web
5. 📤 Submit a pull request

### Architecture Overview

```
src/features/chat/
├── components/          # UI components
│   ├── Chat.tsx        # Main orchestrating component (47 lines)
│   ├── MessageList.tsx # Virtualized message list (64 lines)
│   ├── MessageBubble.tsx # Individual message (100 lines)
│   ├── InputBar.tsx    # Text input component (63 lines)
│   ├── ChatHeader.tsx  # Header with controls (23 lines)
│   ├── EmptyState.tsx  # Welcome screen (59 lines)
│   └── Avatar.tsx      # User/assistant avatars (25 lines)
├── hooks/
│   └── useChatController.ts # Business logic wrapper (43 lines)
└── types/
    └── index.ts        # TypeScript definitions
```

---

**Questions?** Create an issue using the [Setup Help template](../../../.github/ISSUE_TEMPLATE/setup_help.md)!
