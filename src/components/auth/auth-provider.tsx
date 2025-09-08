'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import type { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ success: boolean; error?: unknown; data?: unknown }>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ success: boolean; error?: unknown; data?: unknown }>;
  signOut: () => Promise<{ success: boolean; error?: unknown }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: unknown; data?: unknown }>;
  updateProfile: (updates: Record<string, unknown>) => Promise<{ success: boolean; error?: unknown; data?: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Show loading state while initializing
  if (!auth.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
