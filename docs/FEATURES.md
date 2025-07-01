# ✨ Features Guide

This document outlines all available features in the Expo Template, their current status, and how to use them.

## 🎯 Overview

The template is designed to be **modular and configurable**. You can enable or disable features via environment variables to keep your bundle size optimized and only include what you need.

## 📊 Feature Status

### ✅ Currently Implemented

| Feature                | Description                         | Environment Variable            | Status   |
| ---------------------- | ----------------------------------- | ------------------------------- | -------- |
| 🤖 **AI Chat**         | OpenAI-powered chat interface       | `OPENAI_API_KEY`                | ✅ Ready |
| 🌓 **Dark Mode**       | Light/dark theme switching          | `EXPO_PUBLIC_ENABLE_DARK_MODE`  | ✅ Ready |
| 📱 **Responsive UI**   | NativeWind (Tailwind) styling       | Built-in                        | ✅ Ready |
| 🔄 **Hot Reload**      | Fast development experience         | Built-in                        | ✅ Ready |
| ⚡ **Haptic Feedback** | Touch feedback on interactions      | `EXPO_PUBLIC_ENABLE_HAPTICS`    | ✅ Ready |
| 🎭 **Animations**      | Smooth UI transitions               | `EXPO_PUBLIC_ENABLE_ANIMATIONS` | ✅ Ready |
| 🧪 **Testing**         | Jest + React Native Testing Library | Built-in                        | ✅ Ready |
| 📦 **TypeScript**      | 100% type coverage                  | Built-in                        | ✅ Ready |
| 🔍 **Code Quality**    | ESLint + Prettier + Husky           | Built-in                        | ✅ Ready |

### 🚧 Planned Features (Future Phases)

| Feature                   | Description                | Environment Variable            | Status     |
| ------------------------- | -------------------------- | ------------------------------- | ---------- |
| 🔐 **Authentication**     | Login/signup with Supabase | `EXPO_PUBLIC_ENABLE_AUTH`       | 📋 Planned |
| 👤 **User Profiles**      | Profile management         | `EXPO_PUBLIC_ENABLE_PROFILE`    | 📋 Planned |
| 📁 **File Storage**       | Upload/manage files        | `EXPO_PUBLIC_ENABLE_STORAGE`    | 📋 Planned |
| 🎓 **Onboarding**         | User onboarding flow       | `EXPO_PUBLIC_ENABLE_ONBOARDING` | 📋 Planned |
| 🔀 **Sidebar Navigation** | Drawer navigation          | `EXPO_PUBLIC_ENABLE_SIDEBAR`    | 📋 Planned |
| 📊 **Analytics**          | Usage tracking             | `EXPO_PUBLIC_ENABLE_ANALYTICS`  | 📋 Planned |
| 🔔 **Push Notifications** | Mobile notifications       | `EXPO_PUBLIC_ENABLE_PUSH`       | 📋 Planned |
| 🌐 **Realtime Features**  | Live data updates          | `EXPO_PUBLIC_ENABLE_REALTIME`   | 📋 Planned |

## 🔧 Core Features

### 🤖 AI Chat Interface

**What it does:** Provides a full-featured chat interface powered by OpenAI's GPT models.

**Configuration:**

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
EXPO_PUBLIC_MAX_MESSAGES=100
EXPO_PUBLIC_DEFAULT_TEMPERATURE=0.7
EXPO_PUBLIC_MAX_TOKENS=2000
EXPO_PUBLIC_STREAMING_ENABLED=true
```

**Features:**

- ✅ Streaming responses
- ✅ Message history
- ✅ Markdown rendering
- ✅ Error handling
- ✅ Loading states
- ✅ Virtualized list for performance

**Usage:**
The chat interface is automatically available on the home screen. Users can start chatting immediately after providing an OpenAI API key.

### 🌓 Dark Mode Support

**What it does:** Provides system-aware dark/light theme switching.

**Configuration:**

```bash
EXPO_PUBLIC_ENABLE_DARK_MODE=true
EXPO_PUBLIC_THEME_MODE=system  # light, dark, or system
```

**Features:**

- ✅ System theme detection
- ✅ Manual theme toggle
- ✅ Consistent styling across all components
- ✅ Smooth transitions

**Usage:**
Theme toggles are available in the header. The app respects system theme preferences by default.

### 📱 Responsive Design

**What it does:** Provides a consistent, responsive UI across iOS, Android, and Web.

**Technology:** Built with NativeWind (Tailwind CSS for React Native)

**Features:**

- ✅ Unified styling system
- ✅ Platform-specific adaptations
- ✅ Responsive breakpoints
- ✅ Accessibility support

### ⚡ Performance Optimizations

**What it does:** Ensures smooth performance across all platforms.

**Features:**

- ✅ FlatList virtualization for large lists
- ✅ React.memo for component optimization
- ✅ Safe animations with Reanimated
- ✅ Bundle splitting and lazy loading

**Configuration:**

```bash
EXPO_PUBLIC_ENABLE_ANIMATIONS=true
EXPO_PUBLIC_ANIMATION_DURATION=300
EXPO_PUBLIC_ENABLE_HAPTICS=true
```

## 🔮 Planned Features

### 🔐 Authentication System

**Planned for:** Phase 2

**What it will do:** Complete authentication system with Supabase backend.

**Planned Features:**

- Email/password authentication
- Social logins (Google, Apple)
- Session management
- Protected routes
- Password reset
- Email verification

**Configuration:**

```bash
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 👤 User Profile Management

**Planned for:** Phase 2

**What it will do:** User profile screens and management.

**Planned Features:**

- Profile creation/editing
- Avatar uploads
- Settings management
- Account deletion
- Privacy controls

### 📁 File Storage & Uploads

**Planned for:** Phase 4

**What it will do:** Complete file management system.

**Planned Features:**

- Image/file uploads
- File organization
- Sharing capabilities
- Storage quotas
- Multiple file formats

### 🎓 User Onboarding

**Planned for:** Phase 3

**What it will do:** Guided introduction for new users.

**Planned Features:**

- Welcome screens
- Feature tour
- Setup assistance
- Progress tracking
- Skip options

## 🔄 Feature Configuration

### Enabling Features

Features are controlled via environment variables in your `.env.local` file:

```bash
# Enable a feature
EXPO_PUBLIC_ENABLE_FEATURE_NAME=true

# Disable a feature
EXPO_PUBLIC_ENABLE_FEATURE_NAME=false
```

### Feature Dependencies

Some features depend on others:

```
Authentication (enableAuth)
  ├── Profile Management (enableProfile) ⚠️ requires enableAuth
  └── Social Auth (enableSocialAuth) ⚠️ requires enableAuth

Storage (enableStorage)
  └── File Uploads (enableFileUploads) ⚠️ requires enableStorage

Navigation
  ├── Sidebar (enableSidebar) ⚠️ conflicts with enableTabNavigation
  └── Tab Navigation (enableTabNavigation) ⚠️ conflicts with enableSidebar
```

### Validation

The template automatically validates feature dependencies and will warn you about conflicts:

```bash
npm run start
# Console output:
# [WARN] enableProfile requires enableAuth to be enabled
```

## 🧪 Testing Features

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

Current test coverage:

- ✅ Core components
- ✅ Hooks and utilities
- ✅ Configuration system
- ✅ Feature flag logic

### Writing Tests

Tests are co-located with components:

```
src/features/chat/components/
├── MessageBubble.tsx
└── __tests__/
    └── MessageBubble.test.tsx
```

## 🚀 Using Features in Your Code

### Feature Flag Checks

```typescript
import { FEATURES, isFeatureEnabled } from '@/config';

// Check if a feature is enabled
if (FEATURES.enableAuth) {
  // Show auth-related UI
}

// Using the utility function
if (isFeatureEnabled('enableDarkMode')) {
  // Dark mode specific logic
}
```

### Conditional Rendering

```typescript
import { FEATURES } from '@/config';

export default function App() {
  return (
    <View>
      {FEATURES.enableAuth && <AuthProvider>}
        <MainContent />
      {FEATURES.enableAuth && </AuthProvider>}
    </View>
  );
}
```

### Configuration Access

```typescript
import { config } from '@/config';

// Access branding configuration
const primaryColor = config.branding.colors.primary;
const appName = config.branding.appName;

// Access feature flags
const isDarkModeEnabled = config.features.enableDarkMode;
```

## 📚 Next Steps

1. **Explore Current Features**: Try out the AI chat and theme switching
2. **Customize Configuration**: Adjust settings in your `.env.local`
3. **Stay Updated**: Watch for new feature releases
4. **Contribute**: Help us build the planned features!

## 🤝 Contributing

Interested in helping build new features? Check out our [contributing guidelines](../CONTRIBUTING.md) and the [roadmap](../roadmap/) for upcoming work.

---

**Questions?** Create an issue using our [Setup Help template](../.github/ISSUE_TEMPLATE/setup_help.md)!
