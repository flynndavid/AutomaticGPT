# Auth & Onboarding Setup Guide

This guide will help you set up authentication and onboarding features in your Expo app.

## 🚀 Quick Start

1. **Copy Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

2. **Enable Features** (edit your `.env.local`)

   ```bash
   EXPO_PUBLIC_ENABLE_AUTH=true
   EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true
   EXPO_PUBLIC_ENABLE_ONBOARDING=true
   EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true
   ```

3. **Set up Supabase** (required for auth)
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Update your `.env.local`:
     ```bash
     EXPO_PUBLIC_SUPABASE_URL=your_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Run Database Migration**
   Execute this SQL in your Supabase SQL editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE,
     phone TEXT UNIQUE,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Create trigger for new user profiles
   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, full_name)
     VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

5. **Start the App**
   ```bash
   npm start
   ```

## 🎛️ Feature Configuration

### Authentication Methods

Control which authentication methods are available:

```bash
# Email/Password (always recommended)
EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true

# SMS Authentication (future feature)
EXPO_PUBLIC_ENABLE_SMS_AUTH=false

# OAuth Providers (future features)
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false
EXPO_PUBLIC_ENABLE_APPLE_AUTH=false
```

### Splash & Onboarding

```bash
# Show custom splash screen with app branding
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true

# Show onboarding carousel for new users
EXPO_PUBLIC_ENABLE_ONBOARDING=true
```

## 📱 User Flow

With all features enabled:

1. **Splash Screen** - App logo and loading indicator
2. **Onboarding** - 3-slide carousel explaining features (skippable)
3. **Authentication** - Unified login/signup form
4. **Main App** - Chat interface (authenticated users only)

## 🔧 Customization

### Splash Screen

Edit `src/features/splash/components/SplashScreen.tsx`:

- Change app name
- Add your logo
- Customize background

### Onboarding Slides

Edit `src/features/onboarding/data/slides.ts`:

- Modify slide content
- Add images
- Change colors

### Auth Screen

Edit `src/features/auth/components/AuthForm.tsx`:

- Customize form fields
- Add validation rules
- Modify styling

## 🏗️ Architecture

### Route Structure

```
src/app/
├── _layout.tsx          # Root layout with auth wrapper
├── (auth)/              # Authentication routes
│   ├── _layout.tsx      # Auth layout (unauthenticated only)
│   ├── welcome.tsx      # Onboarding or direct to login
│   └── login.tsx        # Authentication form
├── (app)/               # Protected routes
│   ├── _layout.tsx      # App layout (authenticated only)
│   └── index.tsx        # Main app (Chat)
└── index.tsx            # Route redirect logic
```

### Feature Structure

```
src/features/
├── auth/                # Authentication feature
│   ├── components/      # Auth UI components
│   ├── hooks/          # Auth logic (useAuth, useAuthForm)
│   └── types/          # Auth TypeScript types
├── onboarding/         # Onboarding feature
│   ├── components/     # Onboarding UI
│   ├── hooks/         # Onboarding state management
│   └── data/          # Slide content
└── splash/            # Splash screen feature
    ├── components/    # Splash UI
    └── hooks/        # Splash timing logic
```

## 🔒 Security

### Supabase Security

- Row Level Security (RLS) is enabled by default
- Users can only access their own profile data
- Authentication handled by Supabase Auth

### Environment Variables

- Never commit real API keys
- Use `.env.local` for development
- Set production keys in your deployment platform

## 🧪 Testing

### Manual Testing Checklist

- [ ] Splash screen shows and dismisses
- [ ] Onboarding can be skipped
- [ ] User can create account
- [ ] User can sign in
- [ ] User can sign out
- [ ] Session persists on app restart
- [ ] Protected routes redirect to auth

### Error Scenarios

- [ ] Invalid email format
- [ ] Weak password
- [ ] Network failure
- [ ] Supabase service unavailable

## 🚫 Disabling Features

### Disable Authentication

```bash
EXPO_PUBLIC_ENABLE_AUTH=false
```

App will go directly to chat without auth requirements.

### Disable Onboarding

```bash
EXPO_PUBLIC_ENABLE_ONBOARDING=false
```

Users go directly to login screen.

### Disable Splash Screen

```bash
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=false
```

App starts immediately without custom splash.

## 🔮 Future Features

Coming in future updates:

- SMS authentication with OTP
- Google Sign-In
- Apple Sign-In (iOS)
- Biometric authentication
- Password reset flow
- Profile management
- Account deletion

## 🆘 Troubleshooting

### Common Issues

**"Cannot connect to Supabase"**

- Check your Supabase URL and anon key
- Verify your Supabase project is active
- Check network connectivity

**"Auth redirects not working"**

- Clear app data/storage
- Check that both auth and app route groups exist
- Verify navigation logic in layouts

**"Splash screen shows forever"**

- Check console for JavaScript errors
- Verify expo-splash-screen is installed
- Check if splash screen timing is too long

### Debug Mode

Enable debug logging:

```bash
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

## 📞 Support

- Check the [FEATURES.md](../FEATURES.md) for implementation status
- Review the [implementation guide](../roadmap/in_progress/auth_onboarding_implementation_guide.md)
- Open an issue for bugs or feature requests
