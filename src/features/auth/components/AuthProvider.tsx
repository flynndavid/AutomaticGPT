/**
 * AuthProvider Component
 * Provides authentication context to the entire app
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

  // Track initialization and active operations
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeOperations, setActiveOperations] = useState<Set<string>>(new Set());
  const [profileLoading, setProfileLoading] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);

  // Operation tracking helpers
  const startOperation = (operationId: string) => {
    setActiveOperations((prev) => new Set([...prev, operationId]));
    setState((prev) => ({ ...prev, isLoading: true }));
  };

  const completeOperation = (operationId: string) => {
    setActiveOperations((prev) => {
      const next = new Set(prev);
      next.delete(operationId);
      if (next.size === 0) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
      return next;
    });
  };

  // Load user profile
  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      // Prevent duplicate profile loading requests
      if (profileLoading.has(userId)) {
        console.log(
          `[AUTH] Profile already loading for user ${userId}, skipping duplicate request`
        );
        return null;
      }

      try {
        setProfileLoading((prev) => new Set([...prev, userId]));

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
        setProfileLoading((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [] // Remove profileLoading dependency to prevent infinite re-creation
  );

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        setIsInitializing(true);

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
            setIsInitializing(false);
          }
          return;
        }

        // Get initial session with timeout
        const { session, error } = await auth.getSession();

        if (error) {
          console.warn('[AUTH] Session error:', error.message);
          throw new Error(error.message);
        }

        // Set auth state immediately, load profile in background
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: !!session,
            user: session?.user || null,
            session,
            profile: null, // Start with null, will be loaded async
            isLoading: false,
          }));
        }

        // Load profile in background (non-blocking)
        if (session?.user && mounted) {
          loadProfile(session.user.id)
            .then((profile) => {
              if (mounted) {
                setState((prev) => ({
                  ...prev,
                  profile,
                }));
              }
            })
            .catch((error) => {
              console.warn('[AUTH] Initial profile loading failed:', error);
            });
        }

        // Only set up auth listener after initial session check completes
        if (mounted && supabase) {
          try {
            const {
              data: { subscription: authSubscription },
            } = supabase.auth.onAuthStateChange(async (event, session) => {
              // Don't process auth changes during initialization
              if (isInitializing) {
                return;
              }

              console.log(`[AUTH] Auth state change: ${event}`);

              // Update auth state immediately, load profile in background
              if (mountedRef.current) {
                setState((prev) => ({
                  ...prev,
                  isAuthenticated: !!session,
                  user: session?.user || null,
                  session,
                  profile: null, // Start with null, will be loaded async
                  isLoading: false,
                  error: null, // Clear errors on auth state change
                }));
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
          } catch (listenerError) {
            console.error('[AUTH] Failed to set up auth listener:', listenerError);
          }

          if (mounted) {
            setIsInitializing(false);
          }
        } else {
          if (mounted) {
            setIsInitializing(false);
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
            error: null, // Don't show error, just disable auth
          }));
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      mountedRef.current = false;

      // Always cleanup subscription if it exists, regardless of configuration state
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('[AUTH] Auth listener cleaned up successfully');
        } catch (cleanupError) {
          console.warn('[AUTH] Error during auth listener cleanup:', cleanupError);
        }
      }
    };
  }, [loadProfile]);

  // Authentication actions
  const signIn = async (email: string, password: string): Promise<void> => {
    const operationId = 'signIn';
    try {
      startOperation(operationId);
      setState((prev) => ({ ...prev, error: null }));

      const { error } = await auth.signIn(email, password);
      if (error) throw error;

      // Don't complete operation here - wait for auth state change
    } catch (error) {
      completeOperation(operationId);
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
    const operationId = 'signUp';
    try {
      startOperation(operationId);
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
      await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced from 1000ms to 100ms

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
          // Rollback: attempt to delete auth user (may not work without admin privileges)
          console.error('[AUTH] Profile creation failed, user may be in inconsistent state');
          throw new Error('Failed to create user profile');
        }
      }

      // Don't complete operation here - wait for auth state change
    } catch (error) {
      completeOperation(operationId);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  const signOut = useCallback(async (): Promise<void> => {
    const operationId = 'signOut';
    try {
      startOperation(operationId);
      setState((prev) => ({ ...prev, error: null }));

      const { error } = await auth.signOut();
      if (error) throw error;

      // Don't complete operation here - wait for auth state change
    } catch (error) {
      completeOperation(operationId);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  }, []);

  const resetPassword = async (email: string): Promise<void> => {
    const operationId = 'resetPassword';
    try {
      startOperation(operationId);
      setState((prev) => ({ ...prev, error: null }));

      const { error } = await auth.resetPassword(email);
      if (error) throw error;

      completeOperation(operationId);
    } catch (error) {
      completeOperation(operationId);
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

  // Complete operations when auth state changes (but not during initialization)
  useEffect(() => {
    if (!isInitializing && activeOperations.size > 0) {
      // Complete all active operations when auth state changes
      const currentOperations = Array.from(activeOperations);
      setActiveOperations(new Set());
      setState((prev) => ({ ...prev, isLoading: false }));
      console.log('[AUTH] Cleared operations on auth state change:', currentOperations);
    }
  }, [state.isAuthenticated, state.user?.id, isInitializing]);

  // Add timeout handling for stuck operations
  useEffect(() => {
    if (activeOperations.size > 0) {
      const timeout = setTimeout(() => {
        console.warn(
          '[AUTH] Operations timeout, clearing stuck operations:',
          Array.from(activeOperations)
        );
        setActiveOperations(new Set());
        setState((prev) => ({ ...prev, isLoading: false }));
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [activeOperations]);

  // Automatic session refresh
  useEffect(() => {
    if (!isSupabaseConfigured() || !state.session) {
      return;
    }

    const checkAndRefreshSession = async () => {
      try {
        const expiresAt = state.session?.expires_at;
        if (!expiresAt) return;

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        // Refresh session 5 minutes before expiry
        if (timeUntilExpiry <= 300) {
          console.log('[AUTH] Session expiring soon, refreshing...');
          await refreshSession();
        }
      } catch (error) {
        console.warn('[AUTH] Session refresh check failed:', error);
      }
    };

    // Check session every minute
    const interval = setInterval(checkAndRefreshSession, 60000);

    return () => clearInterval(interval);
  }, [state.session, refreshSession]);

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
