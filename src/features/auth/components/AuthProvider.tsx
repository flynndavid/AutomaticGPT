/**
 * AuthProvider Component
 * Provides authentication context to the entire app
 */

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { auth, supabase } from '@/lib/supabase';
import type { AuthContextType, AuthState } from '../types';
import type { SupabaseUser, SupabaseSession } from '@/lib/supabase';

// Create authentication context
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the app with authentication context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null,
  });

  // Initialize authentication state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await auth.getSession();
        if (error) throw error;

        setState((prev) => ({
          ...prev,
          isAuthenticated: !!session,
          user: session?.user || null,
          session,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to get session',
          isLoading: false,
        }));
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState((prev) => ({
        ...prev,
        isAuthenticated: !!session,
        user: session?.user || null,
        session,
        isLoading: false,
        error: null, // Clear errors on auth state change
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Authentication actions
  const signIn = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await auth.signIn(email, password);
      if (error) throw error;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await auth.signUp(email, password);
      if (error) throw error;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await auth.signOut();
      if (error) throw error;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const { error } = await auth.resetPassword(email);
      if (error) throw error;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const updateProfile = async (updates: any): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const { error } = await auth.updateUser({ data: updates });
      if (error) throw error;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      throw error;
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const { session, error } = await auth.getSession();
      if (error) throw error;

      setState((prev) => ({
        ...prev,
        isAuthenticated: !!session,
        user: session?.user || null,
        session,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      }));
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    updateProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
