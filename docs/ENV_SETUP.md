# Environment Configuration Guide

## Overview

This guide explains how to set up environment variables for the Expo template project.

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```bash
# ===========================================
# TEMPLATE CONFIGURATION
# ===========================================
# Copy this to .env and update with your values

# App Configuration
EXPO_PUBLIC_APP_NAME=MyApp
EXPO_PUBLIC_APP_DESCRIPTION=Your AI-powered assistant

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8081
OPENAI_API_KEY=your_openai_api_key_here

# Feature Flags
EXPO_PUBLIC_ENABLE_CHAT=true
EXPO_PUBLIC_ENABLE_VOICE_INPUT=false
EXPO_PUBLIC_ENABLE_THEME_TOGGLE=true

# Authentication & Onboarding
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true

# Individual Auth Methods
EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true
EXPO_PUBLIC_ENABLE_SMS_AUTH=false
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false
EXPO_PUBLIC_ENABLE_APPLE_AUTH=false

# Supabase Configuration (required if AUTH is enabled)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# File Upload Features (now implemented)
EXPO_PUBLIC_ENABLE_STORAGE=true
EXPO_PUBLIC_ENABLE_FILE_UPLOADS=true
EXPO_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes
EXPO_PUBLIC_MAX_IMAGE_SIZE=1024     # Max width/height for AI processing
EXPO_PUBLIC_THUMBNAIL_SIZE=150      # Thumbnail size in pixels

# Future Features (not yet implemented)
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=false

# Development Configuration
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=info
```

## Variable Descriptions

### App Configuration

- `EXPO_PUBLIC_APP_NAME`: Your application name displayed in the UI
- `EXPO_PUBLIC_APP_DESCRIPTION`: Brief description of your app
- `EXPO_PUBLIC_API_URL`: API endpoint URL (defaults to localhost for development)
- `OPENAI_API_KEY`: Your OpenAI API key for AI features (get from https://platform.openai.com)

### Feature Flags

These control which features are enabled in your app:

- `EXPO_PUBLIC_ENABLE_CHAT`: Enable/disable chat functionality
- `EXPO_PUBLIC_ENABLE_VOICE_INPUT`: Enable/disable voice input (not yet implemented)

### File Upload Configuration

- `EXPO_PUBLIC_ENABLE_STORAGE`: Enable/disable Supabase storage integration
- `EXPO_PUBLIC_ENABLE_FILE_UPLOADS`: Enable/disable file upload functionality in chat
- `EXPO_PUBLIC_MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `EXPO_PUBLIC_MAX_IMAGE_SIZE`: Maximum image dimensions for AI processing (default: 1024px)
- `EXPO_PUBLIC_THUMBNAIL_SIZE`: Size of generated thumbnails (default: 150px)
- `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`: Name of the Supabase storage bucket (default: chat-files)
- `EXPO_PUBLIC_ENABLE_THEME_TOGGLE`: Enable/disable dark mode toggle
- `EXPO_PUBLIC_ENABLE_AUTH`: Enable/disable authentication system
- `EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING`: Enable/disable splash screen and onboarding flow

### Authentication Methods

Control individual authentication providers:

- `EXPO_PUBLIC_ENABLE_EMAIL_AUTH`: Email/password authentication
- `EXPO_PUBLIC_ENABLE_SMS_AUTH`: SMS/phone authentication (planned)
- `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH`: Google OAuth (planned)
- `EXPO_PUBLIC_ENABLE_APPLE_AUTH`: Apple Sign In (planned, iOS only)

### Supabase Configuration

Required when `EXPO_PUBLIC_ENABLE_AUTH` is true:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

Get these from your Supabase project dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon public key

### Development Configuration

- `EXPO_PUBLIC_DEBUG_MODE`: Enable debug logging
- `EXPO_PUBLIC_LOG_LEVEL`: Logging level (debug, info, warn, error)

## Important Notes

1. **EXPO*PUBLIC* Prefix**: All client-side environment variables must start with `EXPO_PUBLIC_`
2. **Server-side Variables**: Variables without the prefix (like `OPENAI_API_KEY`) are only available in API routes
3. **Security**: Never commit your `.env` file to version control
4. **Development**: Use different `.env` files for development and production

## Getting Started

1. Copy the template above to a new `.env` file in your project root
2. Update the values with your actual configuration
3. Restart your Expo development server for changes to take effect

## Troubleshooting

- If environment variables aren't loading, ensure your `.env` file is in the project root
- Restart the Metro bundler after changing environment variables
- Check that you're using the `EXPO_PUBLIC_` prefix for client-side variables
- Verify your Supabase credentials are correct if auth isn't working
