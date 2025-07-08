# AutomaticGPT Template

> 🚀 **A production-ready Expo template with AI chat, authentication, conversation management, analytics, and sharing features**

[![NPM Package](https://img.shields.io/npm/v/create-automaticgpt-template?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/create-automaticgpt-template)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020.svg?style=for-the-badge&logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

**AutomaticGPT** is a comprehensive Expo template that jumpstarts your AI-powered mobile and web applications. Get a fully-featured app with authentication, conversation management, analytics, and sharing capabilities in under 5 minutes.

## 🚀 Quick Installation

### One-Command Setup (Recommended)

```bash
npx create-automaticgpt-template MyApp
cd MyApp
```

### Alternative: Manual Clone

```bash
git clone https://github.com/flynndavid/AutomaticGPT.git MyApp
cd MyApp
npm install
```

### 🎯 Interactive Setup

After installation, run the setup wizard to configure your app:

```bash
npm run setup
```

Or configure manually:

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
npm run start
```

## ✨ What's Included

### 🔐 Complete Authentication System

- Email/password authentication with Supabase
- User profiles with editing capabilities
- Session management with persistence
- Password reset functionality
- Secure user isolation

### 🤖 AI Chat Interface

- **OpenAI GPT-4o** integration with streaming responses
- Persistent message history with virtualized scrolling
- Tool support for structured AI responses
- Real-time conversation updates

### 📊 Conversation Management

- **Full CRUD operations** - Create, read, update, delete conversations
- **Archive/Restore** - Archive conversations without deletion
- **Rich metadata** - Search and organize conversations
- **User isolation** - Secure conversation separation

### 📈 Analytics Dashboard

- **Token usage tracking** - Monitor AI API costs and consumption
- **Response time metrics** - Track AI performance
- **Model usage statistics** - Monitor which AI models are used
- **Data export** - Export analytics in JSON and CSV formats
- **Interactive visualizations** - Charts and graphs for insights

### 🔗 Conversation Sharing

- **Public/Private sharing** - Share conversations with custom permissions
- **Link generation** - Create shareable links with expiration dates
- **Email invitations** - Share with specific users via email
- **Permission management** - Control read/write access levels

### 🧭 Navigation & UX

- **Onboarding flow** - Guided user introduction
- **Sidebar navigation** - Collapsible navigation menu
- **Theme support** - Light/dark mode with system preference detection
- **Responsive design** - Optimized for mobile, tablet, and web
- **Smooth animations** - Reanimated v3 transitions

### 🎨 Modern Tech Stack

- **Expo SDK 53** - Latest cross-platform framework
- **TypeScript** - 100% type coverage
- **NativeWind** - Tailwind CSS for React Native
- **Supabase** - Backend-as-a-Service
- **ESLint + Prettier** - Code quality and formatting
- **Jest** - Testing framework

## 🛠️ Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (Mac) or **Android Emulator**

## ⚙️ Configuration

### Required Environment Variables

The template requires these API keys to function:

```bash
# OpenAI API Key (Required)
OPENAI_API_KEY="your_openai_api_key"

# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL="your_supabase_url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# App Configuration (Optional)
EXPO_PUBLIC_APP_NAME="Your App Name"
EXPO_PUBLIC_APP_SLUG="your-app-slug"
```

### Setup Methods

**Option 1: Interactive Setup (Recommended)**

```bash
npm run setup
```

The setup wizard will guide you through:

- API key configuration
- Database setup
- Feature selection
- Environment file creation

**Option 2: Manual Setup**

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL migration: `supabase/migrations/001_create_conversations_system.sql`
3. Update environment variables with your Supabase credentials

### API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Supabase**: Get your credentials from your Supabase project settings

## 🏗️ Project Architecture

The template uses a **feature-based architecture** for maximum maintainability:

```
src/
├── app/                    # Expo Router routes & API endpoints
│   ├── (auth)/            # Authentication screens (login, welcome)
│   ├── (app)/             # Main app screens (chat, dashboard)
│   └── api/               # API routes (chat endpoint)
├── features/              # Feature-based organization
│   ├── auth/              # Complete authentication system
│   ├── chat/              # AI chat functionality
│   ├── onboarding/        # User onboarding flow
│   └── shared/            # Shared components & utilities
├── config/               # App configuration & feature flags
├── lib/                  # Utilities and integrations
└── types/                # TypeScript definitions
```

### Key Architecture Principles

- **Feature Co-location**: All related code lives together
- **Barrel Exports**: Clean import paths via `index.ts` files
- **Single Responsibility**: Each component has one clear purpose
- **Type Safety**: 100% TypeScript coverage
- **Performance First**: Virtualized lists, optimized animations

## 🚀 Development

### Available Scripts

```bash
# Development
npm run start          # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # Run TypeScript checks
npm run test          # Run tests
npm run format        # Format code with Prettier

# Setup & Deployment
npm run setup         # Interactive setup wizard
npm run deploy        # Deploy to production
```

### Code Quality Features

- **ESLint v9** with Expo preset and flat config
- **Prettier** for consistent code formatting
- **Husky** pre-commit hooks for quality checks
- **TypeScript** strict mode with 100% coverage
- **Jest** testing framework with React Native Testing Library

## 🌟 Feature Flags

All major features can be enabled/disabled via environment variables:

```bash
# Feature Flags (all default to true)
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_CONVERSATION_MANAGEMENT=true
EXPO_PUBLIC_ENABLE_CONVERSATION_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CONVERSATION_SHARING=true
EXPO_PUBLIC_ENABLE_ONBOARDING=true
EXPO_PUBLIC_ENABLE_SIDEBAR=true
EXPO_PUBLIC_ENABLE_THEME_CUSTOMIZATION=true
```

This allows you to:

- Start with a minimal chat app
- Gradually enable features as needed
- Customize the template for your specific use case
- Reduce bundle size by disabling unused features

## 📚 Documentation

### Quick Links

- [📖 Complete Setup Guide](docs/SETUP.md)
- [⚡ Features Documentation](docs/FEATURES.md)
- [🔐 Authentication Setup](docs/AUTH_ONBOARDING_SETUP.md)
- [🚀 Deployment Guide](docs/deployment/)

### Feature Guides

- [💬 Chat System](docs/features/chat/)
- [🔐 Authentication](docs/features/auth/)
- [📊 Analytics](docs/features/analytics/)
- [🔗 Sharing](docs/features/sharing/)

## 🚀 Deployment

### Web Deployment

```bash
npm run deploy
```

### Mobile App Deployment

```bash
# Configure EAS Build
npx eas build:configure

# Build for app stores
npx eas build

# Submit to stores
npx eas submit
```

## 🎯 Use Cases

This template is perfect for:

- **AI-powered chat applications**
- **Customer support platforms**
- **Educational tools with AI tutoring**
- **Personal AI assistants**
- **Content creation tools**
- **Business automation platforms**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Expo](https://expo.dev) - Cross-platform development platform
- [OpenAI](https://openai.com) - AI API provider
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [NativeWind](https://nativewind.dev) - Tailwind CSS for React Native
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations

## 📞 Support & Community

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/flynndavid/AutomaticGPT/issues)
- 💬 [Discussions](https://github.com/flynndavid/AutomaticGPT/discussions)
- 📧 [Email Support](mailto:david@flynndavid.com)

## 🔮 What's Next?

- [ ] Push notifications
- [ ] Voice chat integration
- [ ] Multi-language support
- [ ] Plugin system
- [ ] Advanced analytics
- [ ] Team collaboration features

---

<div align="center">

**[⭐ Star this template](https://github.com/flynndavid/AutomaticGPT)** • **[🚀 Get Started Now](#-quick-installation)** • **[📚 Read the Docs](docs/)**

_Built with ❤️ by [David Flynn](https://github.com/flynndavid)_

</div>
