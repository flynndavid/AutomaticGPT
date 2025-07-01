/**
 * AuthProvider Component
 * Provides authentication context to the entire app
 * Refactored to use onAuthStateChange as single source of truth
 */

import React, { createContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { auth, supabase, db, isSupabaseConfigured } from '@/lib/supabase';
import type { AuthContextType, AuthState, ProfileCreateData } from '../types';
import type { Profile } from '@/lib/supabase';

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
    profile: null,
    error: null,
  });

  // Track if we've received the initial session event
  const [bootstrapped, setBootstrapped] = useState(false);
  const profileLoadingRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  // Enhanced Stage 2: Initialization guard using ref
  const initializationRef = useRef(false);

  // Load user profile
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Prevent duplicate profile loading requests
    if (profileLoadingRef.current.has(userId)) {
      console.log(`[AUTH] Profile already loading for user ${userId}, skipping duplicate request`);
      return null;
    }

    try {
      profileLoadingRef.current.add(userId);

      const { data: profile, error } = await db.getProfile(userId);
      if (error) {
        // Handle specific error cases
        if (error.message?.includes('JSON object requested, multiple (or no) rows returned')) {
          // No rows returned - profile doesn't exist
          console.warn(
            `[AUTH] No profile found for user ${userId}. This may be expected for new users.`
          );
          return null;
        } else {
          console.warn('[AUTH] Failed to load profile:', error.message);
          return null;
        }
      }
      return profile;
    } catch (error) {
      console.warn('[AUTH] Error loading profile:', error);
      return null;
    } finally {
      profileLoadingRef.current.delete(userId);
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    // Enhanced Stage 2: Prevent double initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    let mounted = true;
    let subscription: any = null;
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing auth with onAuthStateChange pattern...');

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.warn('[AUTH] Supabase not configured. Auth features will be disabled.');
          if (mounted) {
            setState((prev) => ({
              ...prev,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            }));
            setBootstrapped(true);
          }
          return;
        }

        // Set up auth listener as the single source of truth
        if (mounted && supabase) {
          try {
            const {
              data: { subscription: authSubscription },
            } = supabase.auth.onAuthStateChange(async (event, session) => {
              console.log(`[AUTH] Auth state change: ${event}`);

              // Update auth state immediately
              if (mountedRef.current) {
                setState((prev) => ({
                  ...prev,
                  isAuthenticated: !!session,
                  user: session?.user || null,
                  session,
                  profile: null, // Start with null, will be loaded async
                  isLoading: false,
                  error: null,
                }));

                // Mark as bootstrapped after first event (INITIAL_SESSION)
                if (!bootstrapped) {
                  setBootstrapped(true);
                }
              }

              // Load profile in background (non-blocking)
              if (session?.user && mountedRef.current) {
                loadProfile(session.user.id)
                  .then((profile) => {
                    if (mountedRef.current) {
                      setState((prev) => ({
                        ...prev,
                        profile,
                      }));
                    }
                  })
                  .catch((error) => {
                    console.warn('[AUTH] Background profile loading failed:', error);
                  });
              }
            });

            subscription = authSubscription;
            console.log('[AUTH] Auth listener initialized successfully');
          } catch (listenerError) {
            console.error('[AUTH] Failed to set up auth listener:', listenerError);
            // Fallback: disable auth instead of blocking the app
            if (mounted) {
              setState((prev) => ({
                ...prev,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              }));
              setBootstrapped(true);
            }
          }
        }
      } catch (error) {
        console.error('[AUTH] Auth initialization error:', error);
        // Gracefully handle auth errors by disabling auth instead of blocking the app
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          }));
          setBootstrapped(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      mountedRef.current = false;

      // Always cleanup subscription if it exists
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('[AUTH] Auth listener cleaned up successfully');
        } catch (cleanupError) {
          console.warn('[AUTH] Error during auth listener cleanup:', cleanupError);
        }
      }
    };
  }, [loadProfile, bootstrapped]);

  // Authentication actions - simplified without complex loading state management
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const { error } = await auth.signIn(email, password);
      if (error) throw error;

      // Don't manage loading state - auth listener will update UI
      console.log('[AUTH] Sign in request sent, waiting for auth state change...');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData?: ProfileCreateData
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // Step 1: Create auth user
      const signUpData: any = {
        email,
        password,
      };

      if (profileData) {
        signUpData.options = {
          data: {
            full_name: profileData.full_name,
            username: profileData.username,
            avatar_url: profileData.avatar_url,
            website: profileData.website,
            phone: profileData.phone,
          },
        };
      }

      const { data, error: authError } = await supabase!.auth.signUp(signUpData);
      if (authError) throw authError;
      if (!data.user) throw new Error('Failed to create user');

      // Step 2: Verify profile creation (wait for database trigger)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: profile, error: profileError } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Step 3: Manual profile creation if trigger failed
      if (profileError || !profile) {
        const { error: manualProfileError } = await supabase!.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: profileData?.full_name || null,
          username: profileData?.username || null,
          avatar_url: profileData?.avatar_url || null,
          website: profileData?.website || null,
          phone: profileData?.phone || null,
        });

        if (manualProfileError) {
          console.error('[AUTH] Profile creation failed, user may be in inconsistent state');
          throw new Error('Failed to create user profile');
        }
      }

      // Don't manage loading state - auth listener will update UI
      console.log('[AUTH] Sign up request sent, waiting for auth state change...');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const { error } = await auth.signOut();
      if (error) throw error;

      // Don't manage loading state - auth listener will update UI
      console.log('[AUTH] Sign out request sent, waiting for auth state change...');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  }, []);

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, error: null }));

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
      if (state.user) {
        // Update the profile in the database
        const { data: updatedProfile, error: profileError } = await db.updateProfile(
          state.user.id,
          updates
        );
        if (profileError) throw profileError;

        // Update the auth user metadata if needed
        const { error: authError } = await auth.updateUser({ data: updates });
        if (authError) throw authError;

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      throw error;
    }
  };

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const { session, error } = await auth.getSession();
      if (error) throw error;

      let profile: Profile | null = null;
      if (session?.user) {
        profile = await loadProfile(session.user.id);
      }

      setState((prev) => ({
        ...prev,
        isAuthenticated: !!session,
        user: session?.user || null,
        session,
        profile,
      }));
      console.log('[AUTH] Session refreshed successfully');
    } catch (error) {
      console.error('[AUTH] Session refresh failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      }));
      // If refresh fails, sign out user
      if (error instanceof Error && error.message.includes('refresh_token_not_found')) {
        console.log('[AUTH] Refresh token invalid, signing out user');
        await signOut();
      }
    }
  }, [signOut, loadProfile]);

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
