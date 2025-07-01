# Auth & Onboarding Setup Guide

## 🚀 Quick Start

The auth and onboarding flow is now fully implemented and ready to use! This guide will help you configure and customize it for your needs.

## 📋 Features Included

✅ **Splash Screen** - Professional app loading with branding  
✅ **Onboarding Flow** - 3-screen carousel with feature highlights  
✅ **Email Authentication** - Login/signup with email and password  
✅ **Persistent Sessions** - Automatic login for returning users  
✅ **Theme Support** - Light/dark mode with consistent styling  
✅ **Navigation Flow** - Automatic routing based on auth state

## 🔧 Environment Setup

### 1. Copy Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Authentication & Onboarding Features
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true
EXPO_PUBLIC_ENABLE_ONBOARDING=true

# Individual Auth Methods
EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true
EXPO_PUBLIC_ENABLE_SMS_AUTH=false
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false
EXPO_PUBLIC_ENABLE_APPLE_AUTH=false

# Supabase Configuration (required)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# UI Features
EXPO_PUBLIC_ENABLE_DARK_MODE=true
EXPO_PUBLIC_ENABLE_SIDEBAR=true
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

#### Run Database Migration

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

## 🎨 Customization

### Splash Screen

Customize in `src/features/splash/components/SplashScreen.tsx`:

- App name
- Logo image
- Background image
- Loading duration

### Onboarding Slides

Edit `src/features/onboarding/data/slides.ts`:

```typescript
export const defaultSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Your App Name',
    description: 'Your app description',
    backgroundColor: '#3b82f6', // Custom color
  },
  // Add more slides...
];
```

### Theme Colors

The app uses a global theme system defined in `src/features/shared/utils/themes.ts`. All auth screens automatically adapt to light/dark mode.

## 🔄 Navigation Flow

```
App Launch
    ↓
Splash Screen (2s)
    ↓
Auth Check
    ├─ Authenticated → Home Screen (Chat)
    └─ Not Authenticated → Onboarding (3 slides)
                              ↓
                          Auth Screen (Login/Signup)
                              ↓
                          Home Screen (Chat)
```

## 🧪 Testing the Flow

1. **First Launch**: See splash → onboarding → auth screen
2. **Skip Onboarding**: Tap "Skip" to go directly to auth
3. **Sign Up**: Create account with email/password
4. **Automatic Login**: Close and reopen app - should go directly to chat
5. **Sign Out**: Use sidebar menu to sign out and return to auth flow

## ⚙️ Feature Flags

Control features via environment variables:

| Variable                               | Default | Description                          |
| -------------------------------------- | ------- | ------------------------------------ |
| `EXPO_PUBLIC_ENABLE_AUTH`              | `true`  | Enable/disable entire auth system    |
| `EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING` | `true`  | Show splash screen                   |
| `EXPO_PUBLIC_ENABLE_ONBOARDING`        | `true`  | Show onboarding carousel             |
| `EXPO_PUBLIC_ENABLE_EMAIL_AUTH`        | `true`  | Email/password authentication        |
| `EXPO_PUBLIC_ENABLE_SMS_AUTH`          | `false` | SMS authentication (not implemented) |
| `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH`       | `false` | Google OAuth (not implemented)       |
| `EXPO_PUBLIC_ENABLE_APPLE_AUTH`        | `false` | Apple Sign-In (not implemented)      |

## 🚨 Troubleshooting

### "Missing Supabase URL" Error

- Ensure `EXPO_PUBLIC_SUPABASE_URL` is set in `.env.local`
- Restart development server after adding env vars

### Auth State Not Persisting

- Check that `@react-native-async-storage/async-storage` is installed
- Verify Supabase client configuration in `src/lib/supabase.ts`

### Onboarding Not Showing

- Verify `EXPO_PUBLIC_ENABLE_ONBOARDING=true` in `.env.local`
- Check that you're starting from an unauthenticated state

### Navigation Issues

- Clear app data/cache and restart
- Check auth state in React Native debugger

## 🔮 Next Steps

### Planned Features (Not Yet Implemented)

- SMS authentication with OTP
- Google OAuth integration
- Apple Sign-In
- Password reset flow
- Profile management screen
- Biometric authentication

### Customization Ideas

- Add your app logo to splash screen
- Customize onboarding slides with your features
- Add company branding and colors
- Implement custom auth providers
- Add terms of service and privacy policy links

## 📚 Related Documentation

- [Features Overview](./FEATURES.md)
- [Setup Guide](./SETUP.md)
- [Chat Feature](./features/chat/README.md)
- [Shared Components](./features/README.md)

## 🆘 Support

If you encounter issues:

1. Check this documentation
2. Verify environment variables
3. Check Supabase project settings
4. Review console errors
5. Create an issue with reproduction steps

# Authentication & Onboarding Setup Guide

This guide explains how to set up authentication with user profiles in your Expo app using Supabase.

## Overview

The authentication system now automatically creates user profiles when users sign up. The profile data is stored in a `profiles` table in the public schema and includes:

- Basic user information (name, email, phone)
- Profile customization (username, avatar, bio, website)
- Automatic timestamps (created_at, updated_at)

## Database Schema

### Profiles Table Structure

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    phone TEXT,
    bio TEXT,

    PRIMARY KEY (id)
);
```

### Automatic Profile Creation

When a user signs up, a database trigger automatically creates a profile record using the metadata provided during signup:

```sql
-- Trigger function that runs after user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security (RLS)

The profiles table has RLS enabled with the following policies:

- **Public Read**: All profiles are viewable by everyone
- **User Insert**: Users can only insert their own profile
- **User Update**: Users can only update their own profile

```sql
-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

## Environment Variables

Make sure you have the following environment variables set:

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage in Code

### Signup Flow

The signup process now automatically creates a profile:

```typescript
import { useAuth } from '@/features/auth';

function SignupForm() {
  const { signUp } = useAuth();

  const handleSignup = async () => {
    const profileData = {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890', // optional
    };

    await signUp(email, password, profileData);
  };
}
```

### Accessing Profile Data

```typescript
import { useAuth } from '@/features/auth';

function ProfileScreen() {
  const { profile, user, updateProfile } = useAuth();

  if (!profile) return <Loading />;

  return (
    <View>
      <Text>{profile.full_name}</Text>
      <Text>{profile.email}</Text>
      {profile.username && <Text>@{profile.username}</Text>}
    </View>
  );
}
```

### Updating Profile

```typescript
const handleUpdateProfile = async () => {
  await updateProfile({
    username: 'johndoe',
    bio: 'Software developer',
    website: 'https://johndoe.com',
  });
};
```

## Database Migration

If you're setting up a new Supabase project, run this migration to create the profiles table:

```sql
-- Create profiles table for user profile data
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    phone TEXT,
    bio TEXT,

    PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## Testing the Setup

1. **Sign up a new user** through your app
2. **Check the profiles table** in your Supabase dashboard
3. **Verify the profile was created** with the correct data
4. **Test profile updates** through the app

## Troubleshooting

### Profile Not Created After Signup

1. Check if the database trigger exists:

   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Verify RLS policies are correct:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. Check Supabase logs for errors during signup

### Profile Data Not Loading

1. Verify the user is authenticated
2. Check RLS policies allow reading profiles
3. Ensure the profile exists in the database

## Security Considerations

- **Email Verification**: Consider enabling email verification in Supabase Auth settings
- **Profile Privacy**: Adjust RLS policies if you need private profiles
- **Data Validation**: Add constraints to the database for data integrity
- **File Uploads**: Set up storage buckets for avatar images if needed

## Next Steps

- Add profile image upload functionality
- Implement username availability checking
- Add social authentication providers
- Create profile completion onboarding flow
