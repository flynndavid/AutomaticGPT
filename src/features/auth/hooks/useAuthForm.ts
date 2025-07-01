import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
  mode: 'login' | 'signup';
}

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async ({ email, password, fullName, mode }: AuthFormData) => {
    setLoading(true);
    setError(null);

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
      
      // Navigation will be handled by auth state change in the provider
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { submit, loading, error, clearError };
}