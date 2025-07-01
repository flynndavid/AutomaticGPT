/**
 * Supabase Configuration & Client Setup
 * Provides type-safe authentication and database access
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

/**
 * Environment variable getters with validation
 */
const getSupabaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL environment variable.\n' +
        'Please add your Supabase project URL to your .env.local file.'
    );
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
        'Please add your Supabase anon key to your .env.local file.'
    );
  }
  return key;
};

/**
 * Database type definitions
 * TODO: Generate these from your Supabase schema
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * Supabase client configuration
 */
export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Authentication helper functions
 */
export const auth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  /**
   * Get current user
   */
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  /**
   * Update user profile
   */
  updateUser: async (updates: { email?: string; password?: string; data?: any }) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },
};

/**
 * Database helper functions
 */
export const db = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { data, error };
  },

  /**
   * Update user profile
   */
  updateProfile: async (
    userId: string,
    updates: Database['public']['Tables']['profiles']['Update']
  ) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Create user profile
   */
  createProfile: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
    const { data, error } = await supabase.from('profiles').insert(profile).select().single();
    return { data, error };
  },
};

/**
 * Real-time subscription helpers
 */
export const realtime = {
  /**
   * Subscribe to profile changes
   */
  subscribeToProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll: () => {
    supabase.removeAllChannels();
  },
};

/**
 * Storage helpers (for file uploads)
 */
export const storage = {
  /**
   * Upload file to storage bucket
   */
  uploadFile: async (bucket: string, path: string, file: File | ArrayBuffer, options?: any) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options);
    return { data, error };
  },

  /**
   * Download file from storage bucket
   */
  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    return { data, error };
  },

  /**
   * Get public URL for file
   */
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage bucket
   */
  deleteFile: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },
};

/**
 * Type exports for use throughout the app
 */
export type SupabaseSession = Awaited<ReturnType<typeof auth.getSession>>['session'];
export type SupabaseUser = Awaited<ReturnType<typeof auth.getUser>>['user'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export default supabase;
