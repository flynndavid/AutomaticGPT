# {Feature Name} Setup Guide

This guide walks you through setting up the {Feature Name} feature in your Expo template project.

## 📋 Prerequisites

Before setting up this feature, ensure you have:

- ✅ Completed [initial project setup](../SETUP.md)
- ✅ Node.js v18+ installed
- ✅ Expo CLI installed
- ✅ [Required dependency features enabled] (if applicable)

### Required Dependencies

```json
{
  "dependencies": {
    "required-package": "^1.0.0",
    "another-package": "^2.0.0"
  }
}
```

## 🔧 Installation

### 1. Install Dependencies

```bash
# Install required packages
npm install required-package another-package

# Or if using yarn
yarn add required-package another-package
```

### 2. Environment Configuration

Add these variables to your `.env.local` file:

```bash
# Enable the feature
EXPO_PUBLIC_ENABLE_{FEATURE}=true

# Required API credentials
{FEATURE}_API_KEY=your_api_key_here
{FEATURE}_SECRET=your_secret_here

# Optional configuration
EXPO_PUBLIC_{FEATURE}_OPTION=value
EXPO_PUBLIC_{FEATURE}_DEBUG=false
```

### 3. External Service Setup

#### Service Provider Account

1. 🌐 Go to [Service Provider](https://service-provider.com)
2. 📝 Create an account or sign in
3. 🔑 Generate API credentials
4. 💳 Set up billing (if required)

#### API Key Configuration

1. **Get your API key:**
   - Navigate to your service dashboard
   - Go to Settings > API Keys
   - Click "Create New Key"
   - Copy the generated key

2. **Add to environment:**

   ```bash
   {FEATURE}_API_KEY=sk-your-actual-api-key-here
   ```

3. **Verify permissions:**
   - Ensure your API key has required permissions
   - Test with a simple API call

## ⚙️ Configuration Options

### Basic Configuration

```typescript
// src/config/features.ts
export const {FEATURE}_CONFIG = {
  enabled: process.env.EXPO_PUBLIC_ENABLE_{FEATURE} === 'true',
  apiKey: process.env.{FEATURE}_API_KEY,
  debug: process.env.EXPO_PUBLIC_{FEATURE}_DEBUG === 'true',
  // Additional options
};
```

### Advanced Configuration

```typescript
// Custom configuration object
const advancedConfig = {
  timeout: 5000,
  retryAttempts: 3,
  enableLogging: true,
  customEndpoint: 'https://api.custom.com',
};
```

## 🔄 Feature Flags

This feature is controlled by feature flags in [`src/config/features.ts`](../../src/config/features.ts):

```typescript
export const FEATURES = {
  enable{Feature}: process.env.EXPO_PUBLIC_ENABLE_{FEATURE} === 'true',
  // Related flags
  enableAuth: process.env.EXPO_PUBLIC_ENABLE_AUTH === 'true', // If required
} as const;
```

### Dependencies

This feature requires these other features to be enabled:

```bash
# Required features
EXPO_PUBLIC_ENABLE_AUTH=true        # For user authentication
EXPO_PUBLIC_ENABLE_STORAGE=true     # For data persistence

# Optional features
EXPO_PUBLIC_ENABLE_ANALYTICS=true   # For usage tracking
```

## ✅ Verification

### 1. Test Configuration

```bash
# Start the development server
npm run start

# Check console output for configuration validation
# Look for: "[{FEATURE}] Feature enabled and configured"
```

### 2. Verify Feature Access

```typescript
// Test in your app component
import { useFeature } from '@/features/{feature-name}';

export function TestComponent() {
  const { isEnabled, status } = useFeature();

  return (
    <View>
      <Text>Feature Enabled: {isEnabled ? 'Yes' : 'No'}</Text>
      <Text>Status: {status}</Text>
    </View>
  );
}
```

### 3. Test Basic Functionality

```typescript
// Basic functionality test
import { testFeature } from '@/features/{feature-name}';

const runTest = async () => {
  try {
    const result = await testFeature();
    console.log('✅ Feature test passed:', result);
  } catch (error) {
    console.error('❌ Feature test failed:', error);
  }
};
```

## 🚨 Troubleshooting

### Common Setup Issues

**"Feature not enabled" error**

```bash
# Check environment variable
echo $EXPO_PUBLIC_ENABLE_{FEATURE}

# Should output: true
```

**"API key invalid" error**

```bash
# Verify API key format
echo ${FEATURE}_API_KEY

# Should start with expected prefix (e.g., 'sk-', 'pk_', etc.)
```

**"Dependencies missing" error**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or clear Metro cache
npx expo start --clear
```

### Configuration Validation

```typescript
// Add to your app to debug configuration
import { config } from '@/config';

console.log('Feature Config:', {
  enabled: config.features.enable{Feature},
  hasApiKey: !!config.{feature}.apiKey,
  environment: config.app.environment,
});
```

### Testing API Connection

```bash
# Test API connection (if applicable)
curl -H "Authorization: Bearer ${FEATURE}_API_KEY" \
     https://api.service.com/test
```

## 📱 Platform-Specific Setup

### iOS Setup

```bash
# iOS specific configuration (if needed)
cd ios && pod install && cd ..
```

### Android Setup

```json
// android/app/build.gradle (if needed)
android {
  // Android specific configuration
}
```

### Web Setup

```bash
# Web specific setup (if needed)
# Usually automatic with Expo
```

## 🔒 Security Considerations

- 🔐 **Never commit API keys** to version control
- 🌍 **Use environment variables** for sensitive data
- 🔄 **Rotate API keys** regularly
- 📝 **Follow service provider security guidelines**

### Environment Variable Security

```bash
# ✅ Good - In .env.local (gitignored)
{FEATURE}_API_KEY=sk-real-key-here

# ❌ Bad - In code
const apiKey = 'sk-real-key-here';
```

## 📚 Next Steps

After setup is complete:

1. 📖 Read the [feature documentation](./README.md)
2. 🎯 Follow the [usage guide](./usage.md)
3. 🔍 Check the [API reference](../api/{feature-name}.md)
4. 🏗️ Start building with the feature!

## 🆘 Getting Help

If you encounter issues:

1. 📖 Check this setup guide thoroughly
2. 🔍 Review the [troubleshooting section](./troubleshooting.md)
3. 🔎 Search existing [GitHub issues](../../issues)
4. 🆕 Create a new issue using the [Setup Help template](../../.github/ISSUE_TEMPLATE/setup_help.md)

---

**Setup Time:** ~10 minutes • **Difficulty:** Beginner
