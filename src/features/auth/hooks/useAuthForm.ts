import { useState } from 'react';
import { useAuth } from './useAuth';
import type { ProfileCreateData } from '../types';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
  mode: 'login' | 'signup';
}

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp } = useAuth();

  const validateFormData = (data: AuthFormData): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (!data.email) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      validationErrors.email = 'Email is invalid';
    }

    if (!data.password) {
      validationErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    if (data.mode === 'signup' && !data.fullName) {
      validationErrors.fullName = 'Full name is required for signup';
    }

    return validationErrors;
  };

  const submit = async ({ email, password, fullName, mode }: AuthFormData) => {
    setLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validationErrors = validateFormData({ email, password, fullName, mode });
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (mode === 'login') {
        await signIn(email, password);
      } else {
        // Create profile data for signup
        const profileData: ProfileCreateData = {
          full_name: fullName || '',
          email: email,
          username: undefined,
          avatar_url: undefined,
          website: undefined,
          phone: undefined,
        };

        await signUp(email, password, profileData);
      }
    } catch (error) {
      // Handle any remaining errors
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    errors,
    clearErrors: () => setErrors({}),
  };
}
