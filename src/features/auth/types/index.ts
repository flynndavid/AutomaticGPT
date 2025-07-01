/**
 * Authentication Types
 * Type definitions for authentication functionality
 */

import type { SupabaseSession, SupabaseUser } from '@/lib/supabase';

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error: string | null;
}

/**
 * Authentication context type
 */
export interface AuthContextType extends AuthState {
  // Authentication actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
