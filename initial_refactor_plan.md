# Initial Refactor Plan for automatic-sandbox-expo-1

## Executive Summary

This document outlines a strategic refactoring plan to prepare the automatic-sandbox-expo-1 codebase for scaling with complex features. The current implementation works well as a proof-of-concept but needs architectural improvements before adding significant functionality. This plan prioritizes maintainability, performance, and developer experience.

## Current State Analysis

### What We Have
- **Working Chat App**: Expo SDK 53 app with AI chat functionality via OpenAI GPT-4o
- **Cross-Platform**: Targets iOS, Android, and Web with server-side rendering
- **Modern Stack**: TypeScript, NativeWind (Tailwind for React Native), expo-router, react-native-reanimated
- **AI Integration**: Streaming responses with tool invocation support

### Key Issues
1. **Monolithic Components**: The main Chat component is ~450 lines mixing UI, state, and business logic
2. **Performance Concerns**: Using ScrollView for messages (no virtualization)
3. **Mixed Styling**: Combination of inline StyleSheet objects and Tailwind classes
4. **No Development Tooling**: Missing linting, formatting, and testing infrastructure
5. **Flat Structure**: All components in a single directory without feature organization

## Refactoring Roadmap

### Phase 1: Development Infrastructure (Day 1)

#### 1.1 Add ESLint & Prettier
**Why**: Enforce consistent code style and catch common errors early.

**Implementation**:
```bash
npm install --save-dev eslint prettier eslint-config-prettier \
  eslint-plugin-react eslint-plugin-react-native \
  eslint-plugin-react-hooks @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin eslint-plugin-tailwindcss
```

Create `.eslintrc.js`:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native', 'react-hooks', 'tailwindcss'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'off', // Using TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    'tailwindcss/no-custom-classname': 'off' // NativeWind allows custom classes
  }
};
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### 1.2 Setup Pre-commit Hooks
```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

#### 1.3 Basic CI Pipeline
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npx expo prebuild --no-install --platform ios
      - run: npx expo prebuild --no-install --platform android
```

Add scripts to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

### Phase 2: Component Architecture Refactor (Days 2-3)

#### 2.1 Split the Chat Component

Current structure has everything in one file. Break it into:

```
src/features/chat/
├── components/
│   ├── ChatHeader.tsx      # Header with menu, title, QR code
│   ├── MessageList.tsx     # Virtualized message list
│   ├── MessageBubble.tsx   # Individual message rendering
│   ├── InputBar.tsx        # Text input with voice/send buttons
│   ├── EmptyState.tsx      # Suggestion cards when no messages
│   └── ToolCard.tsx        # Unified tool result cards
├── hooks/
│   ├── useChatController.ts # Wraps useChat from @ai-sdk/react
│   └── useAutoScroll.ts     # Scroll management logic
├── types/
│   └── index.ts            # Chat-specific types
└── index.ts                # Public exports
```

**Example refactor for MessageBubble.tsx**:
```typescript
import { Text, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <View className={cn('flex-row items-end gap-2', isUser && 'self-end')}>
      {!isUser && <Avatar role="assistant" />}
      <View
        className={cn(
          'p-3 rounded-2xl max-w-[85%]',
          isUser ? 'bg-blue-500 rounded-br-none' : 'bg-white rounded-bl-none'
        )}
      >
        <Text className={cn('text-base', isUser ? 'text-white' : 'text-zinc-800')}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
```

#### 2.2 Convert ScrollView to FlatList

**Why**: ScrollView renders all messages at once. With hundreds of messages, this causes memory issues and janky scrolling.

**Implementation in MessageList.tsx**:
```typescript
import { FlatList, type ListRenderItem } from 'react-native';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const renderMessage: ListRenderItem<ChatMessage> = ({ item }) => (
    <MessageBubble message={item} isUser={item.role === 'user'} />
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      inverted
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
      // Add loading indicator at the bottom (top when inverted)
      ListFooterComponent={isLoading ? <LoadingIndicator /> : null}
    />
  );
}
```

### Phase 3: Styling Consolidation (Day 3)

#### 3.1 Migrate StyleSheet to Tailwind

**Current issue**: Mixed styling approaches make it hard to maintain consistency.

**Solution**: Use NativeWind classes exclusively, reserve StyleSheet only for truly dynamic values.

**Before**:
```typescript
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  }
});

<View style={styles.header}>
```

**After**:
```typescript
<View className="flex-row items-center px-4 py-3">
```

#### 3.2 Create Utility Functions for Complex Styles

For styles that need platform-specific adjustments:
```typescript
// src/lib/styles.ts
export const headerStyle = cn(
  'flex-row items-center justify-between px-4 py-3',
  'border-b border-gray-200',
  {
    'shadow-sm': Platform.OS === 'ios',
    'elevation-1': Platform.OS === 'android',
  }
);
```

### Phase 4: Project Organization (Day 4)

#### 4.1 Feature Folder Structure

Move from flat component structure to feature-based:

```
src/
├── app/                    # Expo Router routes
├── features/
│   ├── chat/              # All chat-related code
│   ├── profile/           # Future: user profiles
│   ├── settings/          # Future: app settings
│   └── shared/            # Shared components
│       ├── components/
│       └── hooks/
├── lib/                   # Generic utilities
├── types/                 # Global TypeScript types
└── config/               # App configuration
```

#### 4.2 Barrel Exports

Each feature folder should have an `index.ts`:
```typescript
// src/features/chat/index.ts
export { Chat } from './components/Chat';
export { useChatController } from './hooks/useChatController';
export type { ChatMessage, ChatRole } from './types';
```

### Phase 5: Type Safety (Day 4)

#### 5.1 Define Domain Types

Create `src/types/chat.ts`:
```typescript
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
```

#### 5.2 API Contract Types

Share types between frontend and API:
```typescript
// src/types/api.ts
import { z } from 'zod';

export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  temperature: z.number().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
```

### Phase 6: Testing Infrastructure (Day 5)

#### 6.1 Setup Jest

```bash
npm install --save-dev jest @types/jest jest-expo \
  @testing-library/react-native @testing-library/jest-native
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
};
```

#### 6.2 Example Component Test

```typescript
// src/features/chat/components/__tests__/MessageBubble.test.tsx
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';

describe('MessageBubble', () => {
  it('renders user message with correct styling', () => {
    const { getByText } = render(
      <MessageBubble
        message={{ id: '1', role: 'user', content: 'Hello' }}
        isUser={true}
      />
    );
    
    const message = getByText('Hello');
    expect(message).toHaveStyle({ color: '#ffffff' }); // white text for user
  });
});
```

### Phase 7: Performance & Animation Safety

#### 7.1 Add Reanimated ESLint Plugin

```bash
npm install --save-dev eslint-plugin-reanimated
```

Update `.eslintrc.js`:
```javascript
{
  plugins: ['reanimated'],
  rules: {
    'reanimated/js-function-in-worklet': 'error',
  }
}
```

#### 7.2 Create Safe Animation Utilities

```typescript
// src/lib/animations.ts
import { runOnJS, withTiming } from 'react-native-reanimated';

export const safeAnimateWithCallback = (
  value: number,
  callback: () => void
) => {
  'worklet';
  return withTiming(value, {}, (finished) => {
    if (finished) {
      runOnJS(callback)();
    }
  });
};
```

### Phase 8: Configuration Management

#### 8.1 Centralized Config

Create `src/config/index.ts`:
```typescript
const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback || '';
};

export const config = {
  api: {
    baseUrl: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:8081'),
    openaiApiKey: getEnvVar('OPENAI_API_KEY'),
  },
  features: {
    enableVoiceInput: getEnvVar('EXPO_PUBLIC_ENABLE_VOICE', 'false') === 'true',
  },
} as const;
```

## Implementation Timeline

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| 1. Dev Infrastructure | 0.5 days | High | None |
| 2. Component Split | 1.5 days | High | Phase 1 |
| 3. FlatList Migration | 0.5 days | High | Phase 2 |
| 4. Styling Consolidation | 0.5 days | Medium | Phase 1 |
| 5. Project Organization | 0.5 days | Medium | Phase 2 |
| 6. Type Safety | 0.5 days | High | Phase 5 |
| 7. Testing Setup | 1 day | Medium | Phase 1 |
| 8. Config Management | 0.5 days | Low | None |

**Total: ~5 days of focused work**

## Success Criteria

- [ ] All components < 150 lines of code
- [ ] No ESLint warnings in CI
- [ ] FlatList handles 1000+ messages smoothly
- [ ] 100% TypeScript coverage (no `any` types)
- [ ] At least one test per component
- [ ] Clean feature folder structure
- [ ] All styles using Tailwind classes

## Migration Strategy

1. **Create feature branch**: `git checkout -b refactor/initial-architecture`
2. **Implement phases in order**: Each phase should be a separate PR
3. **Test on all platforms**: iOS, Android, and Web after each phase
4. **Document breaking changes**: Update README and technical docs
5. **Team review**: Get buy-in before merging each phase

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Comprehensive testing, gradual rollout |
| Team resistance to new patterns | Medium | Document benefits, provide examples |
| Performance regression | Medium | Profile before/after, use React DevTools |
| Increased build complexity | Low | Keep tooling minimal, document setup |

## Next Steps After Refactor

With this foundation in place, the team can confidently add:
- User authentication & profiles
- Multi-modal inputs (voice, images)
- Conversation persistence
- Advanced AI tools & plugins
- Real-time collaboration features
- Offline support

## Questions or Concerns?

Before starting implementation, consider:
1. Do we need to support older React Native versions?
2. Should we add E2E testing (Detox/Maestro)?
3. Any specific performance targets?
4. Preferred state management for future features?

---

*This plan provides a solid foundation for scaling the application. Each phase builds on the previous one, ensuring we don't break existing functionality while improving the architecture.* 