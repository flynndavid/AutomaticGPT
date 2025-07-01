/**
 * Authentication Types
 * Type definitions for authentication functionality
 */

import type { SupabaseSession, SupabaseUser, Profile } from '@/lib/supabase';

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error: string | null;
  profile: Profile | null;
}

/**
 * Authentication context type
 */
export interface AuthContextType extends AuthState {
  // Authentication actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: ProfileCreateData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;

  // User profile actions
  updateProfile: (updates: any) => Promise<void>;

  // Utility functions
  refreshSession: () => Promise<void>;
}

/**
 * Sign in form data
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up form data
 */
export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

/**
 * Profile creation data for signup
 */
export interface ProfileCreateData {
  full_name: string;
  email: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  phone?: string;
}

/**
 * Reset password form data
 */
export interface ResetPasswordData {
  email: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
}
