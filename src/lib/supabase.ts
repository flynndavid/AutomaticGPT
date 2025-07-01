/**
 * Supabase Configuration & Client Setup
 * Provides type-safe authentication and database access
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

/**
 * Storage helper with error handling and fallback
 */
const createStorageAdapter = () => {
  const fallbackStorage = new Map<string, string>();
  let storageAvailable = true;

  // Test storage availability
  const testStorage = async () => {
    try {
      const testKey = '__storage_test__';
      await AsyncStorage.setItem(testKey, 'test');
      await AsyncStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('[STORAGE] AsyncStorage not available, using fallback:', error);
      return false;
    }
  };

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        if (storageAvailable) {
          return await AsyncStorage.getItem(key);
        } else {
          return fallbackStorage.get(key) || null;
        }
      } catch (error) {
        console.warn(`[STORAGE] Failed to get item ${key}:`, error);
        storageAvailable = false;
        return fallbackStorage.get(key) || null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        if (storageAvailable) {
          await AsyncStorage.setItem(key, value);
        }
        // Always store in fallback as backup
        fallbackStorage.set(key, value);
      } catch (error) {
        console.warn(`[STORAGE] Failed to set item ${key}:`, error);
        storageAvailable = false;
        fallbackStorage.set(key, value);
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        if (storageAvailable) {
          await AsyncStorage.removeItem(key);
        }
        fallbackStorage.delete(key);
      } catch (error) {
        console.warn(`[STORAGE] Failed to remove item ${key}:`, error);
        storageAvailable = false;
        fallbackStorage.delete(key);
      }
    },

    async initialize(): Promise<void> {
      storageAvailable = await testStorage();
      if (!storageAvailable) {
        console.warn('[STORAGE] Using in-memory fallback storage');
      }
    },
  };
};

const storageAdapter = createStorageAdapter();

// Initialize storage adapter
storageAdapter.initialize().catch((error) => {
  console.error('[STORAGE] Failed to initialize storage adapter:', error);
});

/**
 * Environment variable getters with validation
 */
const getSupabaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
    return '';
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
    return '';
  }
  return key;
};

/**
 * Database type definitions
 * Updated with conversation system tables
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          phone: string | null;
          bio: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          phone?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          phone?: string | null;
          bio?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'active' | 'archived' | 'shared';
          is_shared: boolean;
          share_token: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status?: 'active' | 'archived' | 'shared';
          is_shared?: boolean;
          share_token?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: 'active' | 'archived' | 'shared';
          is_shared?: boolean;
          share_token?: string;
          archived_at?: string | null;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          role: 'user' | 'assistant' | 'system' | 'tool';
          created_at: string;
          metadata: Record<string, any>;
          model_used: string | null;
          tokens_used: number | null;
          response_time_ms: number | null;
          tool_calls: Record<string, any>[];
          tool_results: Record<string, any>[];
          version: number;
          parent_message_id: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          role: 'user' | 'assistant' | 'system' | 'tool';
          created_at?: string;
          metadata?: Record<string, any>;
          model_used?: string | null;
          tokens_used?: number | null;
          response_time_ms?: number | null;
          tool_calls?: Record<string, any>[];
          tool_results?: Record<string, any>[];
          version?: number;
          parent_message_id?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          content?: string;
          role?: 'user' | 'assistant' | 'system' | 'tool';
          metadata?: Record<string, any>;
          model_used?: string | null;
          tokens_used?: number | null;
          response_time_ms?: number | null;
          tool_calls?: Record<string, any>[];
          tool_results?: Record<string, any>[];
          version?: number;
          parent_message_id?: string | null;
        };
      };
      conversation_shares: {
        Row: {
          id: string;
          conversation_id: string;
          shared_by: string;
          shared_with: string | null;
          permissions: string[];
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          shared_by: string;
          shared_with?: string | null;
          permissions?: string[];
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          shared_by?: string;
          shared_with?: string | null;
          permissions?: string[];
          expires_at?: string | null;
        };
      };
    };
    Views: {
      conversation_summaries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'active' | 'archived' | 'shared';
          is_shared: boolean;
          share_token: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any>;
          message_count: number;
          last_message_at: string | null;
          last_message_preview: string | null;
        };
      };
      shared_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'active' | 'archived' | 'shared';
          is_shared: boolean;
          share_token: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any>;
          shared_by: string;
          shared_with: string | null;
          permissions: string[];
          expires_at: string | null;
          shared_by_email: string | null;
        };
      };
    };
    Functions: {
      generate_conversation_title: {
        Args: { conversation_id_param: string };
        Returns: string;
      };
      cleanup_archived_conversations: {
        Args: {};
        Returns: number;
      };
    };
    Enums: {
      message_role: 'user' | 'assistant' | 'system' | 'tool';
      conversation_status: 'active' | 'archived' | 'shared';
    };
  };
}

/**
 * Supabase client configuration
 */
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Only create client if both URL and key are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: storageAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

// Helper to check if Supabase is available
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

/**
 * Authentication helper functions
 */
export const auth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
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
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
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
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get current session
   */
  getSession: async () => {
    if (!supabase) {
      return { session: null, error: { message: 'Supabase not configured' } };
    }
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
    if (!supabase) {
      return { user: null, error: { message: 'Supabase not configured' } };
    }
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
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  /**
   * Update user profile
   */
  updateUser: async (updates: { email?: string; password?: string; data?: any }) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },
};

/**
 * Database helper functions
 */
export const db = {
  /**
   * Profile operations
   */
  getProfile: async (userId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { data, error };
  },

  updateProfile: async (
    userId: string,
    updates: Database['public']['Tables']['profiles']['Update']
  ) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  createProfile: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.from('profiles').insert(profile).select().single();
    return { data, error };
  },

  /**
   * Conversation operations
   */
  getConversations: async (userId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversation_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  getConversation: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    return { data, error };
  },

  createConversation: async (
    conversation: Database['public']['Tables']['conversations']['Insert']
  ) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();
    return { data, error };
  },

  updateConversation: async (
    conversationId: string,
    updates: Database['public']['Tables']['conversations']['Update']
  ) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();
    return { data, error };
  },

  deleteConversation: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .select()
      .single();
    return { data, error };
  },

  archiveConversation: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();
    return { data, error };
  },

  restoreConversation: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status: 'active',
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();
    return { data, error };
  },

  generateConversationTitle: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.rpc('generate_conversation_title', {
      conversation_id_param: conversationId,
    });
    return { data, error };
  },

  /**
   * Message operations
   */
  getMessages: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  createMessage: async (message: Database['public']['Tables']['messages']['Insert']) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.from('messages').insert(message).select().single();
    return { data, error };
  },

  updateMessage: async (
    messageId: string,
    updates: Database['public']['Tables']['messages']['Update']
  ) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();
    return { data, error };
  },

  deleteMessage: async (messageId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Conversation sharing operations
   */
  shareConversation: async (
    share: Database['public']['Tables']['conversation_shares']['Insert']
  ) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    // First update the conversation to mark it as shared
    await supabase
      .from('conversations')
      .update({ is_shared: true })
      .eq('id', share.conversation_id);

    const { data, error } = await supabase
      .from('conversation_shares')
      .insert(share)
      .select()
      .single();
    return { data, error };
  },

  getConversationShares: async (conversationId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversation_shares')
      .select('*')
      .eq('conversation_id', conversationId);
    return { data, error };
  },

  getSharedConversations: async (userId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('shared_conversations')
      .select('*')
      .eq('shared_with', userId)
      .or('shared_with.is.null')
      .gt('expires_at', new Date().toISOString());
    return { data, error };
  },

  removeConversationShare: async (shareId: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase
      .from('conversation_shares')
      .delete()
      .eq('id', shareId)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Utility functions
   */
  cleanupArchivedConversations: async () => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.rpc('cleanup_archived_conversations');
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
    if (!supabase) {
      console.warn('[REALTIME] Supabase not configured');
      return null;
    }
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
    if (!supabase) {
      console.warn('[REALTIME] Supabase not configured');
      return;
    }
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
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options);
    return { data, error };
  },

  /**
   * Download file from storage bucket
   */
  downloadFile: async (bucket: string, path: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.storage.from(bucket).download(path);
    return { data, error };
  },

  /**
   * Get public URL for file
   */
  getPublicUrl: (bucket: string, path: string) => {
    if (!supabase) {
      return '';
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage bucket
   */
  deleteFile: async (bucket: string, paths: string[]) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
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
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationSummary = Database['public']['Views']['conversation_summaries']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type ConversationShare = Database['public']['Tables']['conversation_shares']['Row'];
export type MessageRole = Database['public']['Enums']['message_role'];
export type ConversationStatus = Database['public']['Enums']['conversation_status'];

/**
 * AppState-aware auto-refresh setup
 * Manages token refresh based on app foreground/background state
 */
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      console.log('[SUPABASE] App became active, starting auto-refresh');
      supabase.auth.startAutoRefresh();
    } else {
      console.log('[SUPABASE] App became inactive, stopping auto-refresh');
      supabase.auth.stopAutoRefresh();
    }
  });
}

export default supabase;
