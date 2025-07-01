# Auth & Onboarding Implementation Guide

## 📋 Overview

This guide outlines the implementation of a complete authentication and onboarding flow for the Expo template, including splash screen, welcome/onboarding screens, and multi-method authentication with Supabase integration.

## 🎯 Feature Goals

- **Splash Screen**: Professional app loading experience with branding
- **Onboarding Flow**: 3-screen feature highlight carousel (skippable)
- **Authentication**: Unified login/signup with email, SMS (planned), and OAuth (planned)
- **Persistent Sessions**: Automatic login for returning users
- **Template-Ready**: Feature flags for maximum customization

## 🏗️ Architecture Overview

### Navigation Flow

```
App Launch
    ↓
Splash Screen (always shown)
    ↓
Auth Check
    ├─ Authenticated → Home Screen (Chat)
    └─ Not Authenticated → Onboarding
                              ↓
                          Auth Screen
                              ↓
                          Home Screen
```

### File Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthScreen.tsx          # Main auth screen
│   │   │   ├── AuthForm.tsx            # Unified login/signup form
│   │   │   ├── AuthMethodButton.tsx    # OAuth/SMS buttons
│   │   │   └── AuthProvider.tsx        # Context provider (exists)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts              # Auth logic (exists)
│   │   │   └── useAuthForm.ts          # Form validation/submission
│   │   └── types/
│   │       └── index.ts                 # Auth types
│   ├── onboarding/
│   │   ├── components/
│   │   │   ├── OnboardingScreen.tsx    # Main container
│   │   │   ├── OnboardingSlide.tsx     # Individual slide
│   │   │   └── OnboardingIndicator.tsx # Progress dots
│   │   ├── hooks/
│   │   │   └── useOnboarding.ts        # Onboarding state
│   │   └── data/
│   │       └── slides.ts                # Slide content
│   └── splash/
│       ├── components/
│       │   └── SplashScreen.tsx         # Splash component
│       └── hooks/
│           └── useSplashScreen.ts       # Splash logic
├── app/
│   ├── _layout.tsx                      # Root layout with auth check
│   ├── (auth)/                          # Auth group
│   │   ├── _layout.tsx                  # Auth layout
│   │   └── welcome.tsx                  # Onboarding route
│   └── (app)/                           # Authenticated group
│       ├── _layout.tsx                  # App layout
│       └── index.tsx                    # Home/Chat screen
└── config/
    └── features.ts                      # Feature flags
```

## 🔧 Implementation Phases

### Phase 1: Foundation & Splash Screen

**Goal**: Set up navigation structure and splash screen

#### 1.1 Update Feature Flags

```typescript
// src/config/features.ts
export const FEATURES = {
  // Existing features...
  AUTH: process.env.EXPO_PUBLIC_ENABLE_AUTH === 'true',
  SPLASH_ONBOARDING: process.env.EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING === 'true',

  // Individual auth methods
  EMAIL_AUTH: process.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH === 'true',
  SMS_AUTH: process.env.EXPO_PUBLIC_ENABLE_SMS_AUTH === 'true',
  GOOGLE_AUTH: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
  APPLE_AUTH: process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === 'true',
} as const;
```

#### 1.2 Create Splash Screen Component

```typescript
// src/features/splash/components/SplashScreen.tsx
import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  appName?: string;
  logoSource?: any;
  backgroundSource?: any;
}

export function SplashScreen({
  appName = 'MyApp',
  logoSource,
  backgroundSource
}: SplashScreenProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="flex-1 items-center justify-center bg-white"
    >
      {backgroundSource && (
        <Image
          source={backgroundSource}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      )}

      <View className="items-center space-y-8">
        {logoSource && (
          <Image
            source={logoSource}
            className="w-32 h-32"
            resizeMode="contain"
          />
        )}

        <Text className="text-3xl font-bold text-gray-900">
          {appName}
        </Text>

        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    </Animated.View>
  );
}
```

#### 1.3 Update Root Layout

```typescript
// src/app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SplashScreen as ExpoSplashScreen } from 'expo-splash-screen';
import { SplashScreen } from '@/features/splash';
import { AuthProvider, useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    setTimeout(async () => {
      setIsReady(true);
      await ExpoSplashScreen.hideAsync();
    }, 2000);
  }, []);

  if (!isReady && FEATURES.SPLASH_ONBOARDING) {
    return <SplashScreen appName="MyApp" />;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}
```

### Phase 2: Onboarding Flow

**Goal**: Create skippable onboarding carousel

#### 2.1 Create Onboarding Data

```typescript
// src/features/onboarding/data/slides.ts
export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image?: any; // Image source
  backgroundColor?: string;
}

export const defaultSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to MyApp',
    description: 'Your AI-powered assistant for everything',
    backgroundColor: '#3b82f6',
  },
  {
    id: '2',
    title: 'Smart Conversations',
    description: 'Chat naturally with advanced AI technology',
    backgroundColor: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Get Started',
    description: 'Sign up or log in to begin your journey',
    backgroundColor: '#10b981',
  },
];
```

#### 2.2 Create Onboarding Components

```typescript
// src/features/onboarding/components/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { OnboardingSlide } from './OnboardingSlide';
import { OnboardingIndicator } from './OnboardingIndicator';
import { defaultSlides } from '../data/slides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < defaultSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={defaultSlides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        keyExtractor={(item) => item.id}
      />

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <OnboardingIndicator
          count={defaultSlides.length}
          currentIndex={currentIndex}
        />

        <View className="flex-row justify-between mt-8">
          <TouchableOpacity onPress={handleSkip} className="p-4">
            <Text className="text-gray-600 text-base">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="bg-blue-500 px-8 py-4 rounded-full"
          >
            <Text className="text-white text-base font-semibold">
              {currentIndex === defaultSlides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
```

### Phase 3: Supabase Setup

**Goal**: Configure Supabase tables and auth

#### 3.1 Database Schema

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

#### 3.2 Update Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper types
export type Profile = {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};
```

### Phase 4: Authentication UI

**Goal**: Create unified auth form with multiple methods

#### 4.1 Auth Screen Layout

```typescript
// src/features/auth/components/AuthScreen.tsx
import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from './AuthForm';
import { AuthMethodButton } from './AuthMethodButton';
import { FEATURES } from '@/config/features';

export function AuthScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600">
              Sign in or create an account to continue
            </Text>
          </View>

          <AuthForm />

          {(FEATURES.SMS_AUTH || FEATURES.GOOGLE_AUTH || FEATURES.APPLE_AUTH) && (
            <>
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or continue with</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <View className="space-y-3">
                {FEATURES.SMS_AUTH && (
                  <AuthMethodButton
                    method="sms"
                    label="Continue with Phone"
                  />
                )}
                {FEATURES.GOOGLE_AUTH && (
                  <AuthMethodButton
                    method="google"
                    label="Continue with Google"
                  />
                )}
                {FEATURES.APPLE_AUTH && Platform.OS === 'ios' && (
                  <AuthMethodButton
                    method="apple"
                    label="Continue with Apple"
                  />
                )}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

#### 4.2 Unified Auth Form

```typescript
// src/features/auth/components/AuthForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthForm } from '../hooks/useAuthForm';
import Toast from 'react-native-toast-message';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const { submit, loading } = useAuthForm();

  const handleSubmit = async () => {
    try {
      await submit({ email, password, fullName, mode });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: error.message,
      });
    }
  };

  return (
    <View className="space-y-4">
      {mode === 'signup' && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base"
            autoCapitalize="words"
          />
        </View>
      )}

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-500 py-4 rounded-lg items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="py-2"
      >
        <Text className="text-center text-blue-500">
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Phase 5: Auth Logic & Navigation

**Goal**: Implement auth flow and protected routes

#### 5.1 Update Auth Hook

```typescript
// src/features/auth/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Navigate based on auth state
      if (session) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
```

#### 5.2 Create Auth Form Hook

```typescript
// src/features/auth/hooks/useAuthForm.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
  mode: 'login' | 'signup';
}

export function useAuthForm() {
  const [loading, setLoading] = useState(false);

  const submit = async ({ email, password, fullName, mode }: AuthFormData) => {
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}
```

## 📝 Environment Variables

Add to `.env.example`:

```bash
# Authentication & Onboarding
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true

# Individual Auth Methods
EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true
EXPO_PUBLIC_ENABLE_SMS_AUTH=false
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false
EXPO_PUBLIC_ENABLE_APPLE_AUTH=false

# Supabase (required if AUTH is enabled)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing Plan

### Unit Tests

- Auth form validation
- Onboarding navigation logic
- Auth state management

### Integration Tests

- Complete auth flow (signup → login → logout)
- Onboarding skip functionality
- Session persistence

### E2E Tests

- Full user journey from splash to authenticated home
- Error handling scenarios
- Network failure recovery

## 🚀 Deployment Checklist

- [ ] Configure Supabase project and run migrations
- [ ] Set environment variables
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on web
- [ ] Verify persistent login works
- [ ] Test all error scenarios
- [ ] Update template documentation

## 🔮 Future Enhancements

### Phase 6: SMS Authentication

- Implement phone number input
- OTP verification flow
- Supabase SMS configuration

### Phase 7: OAuth Providers

- Google Sign-In implementation
- Apple Sign-In (iOS only)
- Social profile data mapping

### Phase 8: Advanced Features

- Biometric authentication
- Magic link login
- Password reset flow
- Account deletion
- Profile management screen

## 📚 References

- [Expo Router Auth Guide](https://docs.expo.dev/router/reference/authentication/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
