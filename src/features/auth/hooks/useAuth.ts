/**
 * useAuth Hook
 * Authentication state management with Supabase
 */

import { useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import type { AuthContextType } from '../types';

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Make sure your component is wrapped with <AuthProvider>.'
    );
  }

  return context;
};
