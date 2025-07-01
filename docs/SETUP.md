# 🚀 Template Setup Guide

Welcome to the Expo Template! This guide will help you get up and running in just a few minutes.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18.0.0 or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** - We recommend npm for consistency
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g @expo/cli`

### Optional for Mobile Development:

- **iOS**: Xcode (Mac only) - [Download from App Store](https://apps.apple.com/app/xcode/id497799835)
- **Android**: Android Studio - [Download here](https://developer.android.com/studio)

## ⚡ Quick Start

### 1. Clone or Create from Template

```bash
# Option A: Use as GitHub template (recommended)
# Click "Use this template" on GitHub and clone your new repo

# Option B: Clone directly
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Run Setup Wizard

```bash
# Install dependencies first
npm install

# Run the interactive setup wizard
npm run setup
```

The setup wizard will guide you through:

- 📝 Configuring your app name and branding
- ✨ Selecting features to enable
- 🎨 Choosing your color scheme
- 🔧 Setting up external services

### 3. Start Development

```bash
# Start the Expo development server
npm run start

# Or directly open on specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## 🔧 Manual Configuration

If you prefer to configure manually, follow these steps:

### 1. Environment Variables

See the [Environment Configuration Guide](ENV_SETUP.md) for detailed instructions.

Quick setup:

```bash
# Create your environment file
cp docs/ENV_SETUP.md .env
# Then edit .env with your actual values
```

### 2. App Configuration

Update `app.json` with your app details:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    ...
  }
}
```

### 3. Package Configuration

Update `package.json`:

```json
{
  "name": "your-app-slug",
  ...
}
```

## 🔑 External Services Setup

### OpenAI (for AI Chat Features)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env`: `OPENAI_API_KEY=your_key_here`

### Supabase (for Auth & Storage)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings > API in your Supabase dashboard
3. Copy your project URL and anon key
4. Add them to your `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

#### Setting up Supabase Authentication

If you're using the authentication feature (`EXPO_PUBLIC_ENABLE_AUTH=true`), you'll need to configure Supabase:

1. **Run Database Migrations**:

   ```sql
   -- In Supabase SQL Editor, run the migration from:
   -- roadmap/pending/auth_onboarding_implementation_guide.md
   ```

2. **Configure Auth Providers** (in Supabase Dashboard):
   - Go to Authentication > Providers
   - Enable Email auth (no email confirmation for development)
   - Configure SMS, Google, Apple auth when ready

3. **Test Authentication**:
   - Start your app with auth enabled
   - Try creating an account with email/password
   - Check the Supabase dashboard to verify user creation

For detailed authentication implementation, see the [Auth & Onboarding Implementation Guide](../roadmap/pending/auth_onboarding_implementation_guide.md).

## 📱 Platform-Specific Setup

### iOS Development

1. Install Xcode from the App Store
2. Install iOS Simulator
3. Run: `npm run ios`

### Android Development

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start your emulator
4. Run: `npm run android`

### Web Development

No additional setup needed! Just run:

```bash
npm run web
```

## 🧪 Testing Your Setup

After configuration, test that everything works:

### 1. Check Configuration

```bash
# Start the app and check console output
npm run start
```

Look for configuration validation messages in the terminal.

### 2. Test Features

- 🌓 **Dark Mode**: Toggle theme in the app
- 🤖 **AI Chat**: Send a message (requires OpenAI key)
- 🔐 **Authentication**: Create account and login (requires Supabase)
- 📱 **Platform**: Test on iOS, Android, and Web

### 3. Verify Environment

Check that your environment variables are loaded:

- Open browser dev tools (F12)
- Look for configuration logs in console
- Verify no missing environment variable errors

## 🚨 Troubleshooting

### Common Issues

**"Missing environment variable" errors**

- Ensure you've created your `.env` file from the template
- Check that all required variables are set
- Restart the development server after changes

**Authentication not working**

- Verify Supabase URL and anon key are correct
- Check that database migrations have been run
- Ensure `EXPO_PUBLIC_ENABLE_AUTH=true` is set
- Look for errors in Supabase logs

**Metro bundler issues**

```bash
# Clear Metro cache and restart
npx expo start --clear
```

**iOS Simulator issues**

```bash
# Reset iOS simulator
xcrun simctl erase all
```

**Android emulator issues**

- Ensure Android emulator is running
- Check Android Studio AVD Manager
- Verify ANDROID_HOME environment variable

### Getting Help

If you encounter issues:

1. 📖 Check this documentation
2. 🔍 Search existing [GitHub Issues](https://github.com/your-username/your-repo/issues)
3. 🆕 Create a new issue using the "Setup Help" template

## ✅ Next Steps

Once you have the template running:

1. 📚 Read the [Features Guide](FEATURES.md) to understand available functionality
2. 🔐 Implement authentication following the [Auth Guide](../roadmap/pending/auth_onboarding_implementation_guide.md)
3. 🎨 Customize your app's branding and styling
4. 🚀 Start building your features!
5. 📖 Check out the [Deployment Guide](DEPLOYMENT.md) when ready to release

Happy coding! 🎉
