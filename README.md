# AutomaticGPT

A modern AI-powered mobile and web application built with Expo, featuring authentication, conversation management, analytics, and sharing capabilities.

## 🚀 Quick Start

This app was created using the [AutomaticGPT Template](https://github.com/flynndavid/AutomaticGPT).

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Optional: Run interactive setup wizard
npm run setup

# Or manually copy environment config
cp .env.example .env.local
# Then edit .env.local with your actual values

# Start the development server
npm run start

# Run on specific platforms
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web Browser
```

## ✅ Features Included

### 🔐 Authentication & User Management

- **Email/Password Authentication** - Secure user registration and login
- **User Profiles** - Comprehensive profile management with editing capabilities
- **Session Management** - Persistent authentication state across app launches
- **Password Reset** - Email-based password recovery

### 💬 AI Chat Interface

- **OpenAI GPT-4o Integration** - Advanced AI conversations
- **Streaming Responses** - Real-time message streaming
- **Message History** - Persistent chat history with virtualized scrolling
- **Tool Support** - AI can use tools and display structured responses

### 🗂️ Conversation Management

- **CRUD Operations** - Create, read, update, delete conversations
- **Archive/Restore** - Archive conversations without deletion
- **Rich Metadata** - Search and organize conversations
- **User Isolation** - Secure conversation separation per user

### 📊 Analytics Dashboard

- **Token Usage Tracking** - Monitor AI API costs and consumption
- **Response Time Metrics** - Track AI performance and response times
- **Model Usage Statistics** - Monitor which AI models are being used
- **Data Export** - Export analytics in JSON and CSV formats
- **Interactive Visualizations** - Charts and graphs for insights

### 🔗 Conversation Sharing

- **Public/Private Sharing** - Share conversations with custom permissions
- **Link Generation** - Create shareable links with expiration dates
- **Email Invitations** - Share with specific users via email
- **Permission Management** - Control read/write access levels

### 🧭 Navigation & Layout

- **Onboarding Flow** - Guided user introduction
- **Sidebar Navigation** - Collapsible navigation menu
- **Theme Support** - Light/dark mode with system preference detection
- **Responsive Design** - Optimized for mobile, tablet, and web

### 🎨 UI & Styling

- **NativeWind** - Tailwind CSS for React Native
- **Theme Customization** - User-controllable color schemes
- **Smooth Animations** - Reanimated v3 transitions
- **Consistent Design** - Unified design system

## 🔧 Configuration

### Environment Variables

Choose one of these setup methods:

**Option 1: Interactive Setup (Recommended for newcomers)**

```bash
npm run setup
```

**Option 2: Manual Setup (Preferred by experienced developers)**

```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

The `.env.example` file contains all available configuration options with documentation:

```bash
# Required - OpenAI API Key
OPENAI_API_KEY="your_openai_api_key"

# Required - Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL="your_supabase_url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# App Configuration
EXPO_PUBLIC_APP_NAME="AutomaticGPT"
EXPO_PUBLIC_APP_SLUG="automaticgpt"

# Feature Flags (all implemented features default to true)
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_CONVERSATION_MANAGEMENT=true
EXPO_PUBLIC_ENABLE_CONVERSATION_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CONVERSATION_SHARING=true
EXPO_PUBLIC_ENABLE_ONBOARDING=true
EXPO_PUBLIC_ENABLE_SIDEBAR=true
EXPO_PUBLIC_ENABLE_THEME_CUSTOMIZATION=true
```

### Database Setup

1. Create a new [Supabase](https://supabase.com) project
2. Run the SQL migration in `supabase/migrations/001_create_conversations_system.sql`
3. Update your environment variables with Supabase credentials

### API Keys

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Supabase**: Get your credentials from your Supabase project settings

## 📁 Project Structure

```
src/
├── app/                    # Expo Router routes & API endpoints
│   ├── (auth)/            # Authentication screens
│   ├── (app)/             # Main app screens
│   └── api/               # API routes
├── features/              # Feature-based organization
│   ├── auth/              # Authentication system
│   ├── chat/              # AI chat functionality
│   ├── onboarding/        # User onboarding
│   └── shared/            # Shared components
├── config/               # App configuration
├── lib/                  # Utilities and integrations
└── types/                # TypeScript definitions
```

## 🛠️ Development

### Available Scripts

```bash
npm run start          # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # Run TypeScript checks
npm run test          # Run tests
npm run format        # Format code with Prettier
```

### Code Quality

- **ESLint** - Code linting with Expo preset
- **Prettier** - Code formatting
- **TypeScript** - 100% type coverage
- **Husky** - Pre-commit hooks for quality checks

## 🚀 Deployment

### Web Deployment

```bash
npm run deploy
```

### Mobile App Deployment

1. Configure EAS Build: `npx eas build:configure`
2. Build for app stores: `npx eas build`
3. Submit to stores: `npx eas submit`

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Features Documentation](docs/FEATURES.md) - Complete feature overview
- [Feature Guides](docs/features/) - Individual feature documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- AI powered by [OpenAI](https://openai.com)
- Backend by [Supabase](https://supabase.com)
- Styling with [NativeWind](https://nativewind.dev)

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/flynndavid/AutomaticGPT/issues)
- 💬 [Discussions](https://github.com/flynndavid/AutomaticGPT/discussions)

---

**Happy coding! 🚀**
