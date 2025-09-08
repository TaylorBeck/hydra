import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    session,
    profile,
    settings,
    isLoading,
    isInitialized,
    setUser,
    setSession,
    setProfile,
    setSettings,
    setLoading,
    setInitialized,
    signOut: signOutStore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reset,
  } = useAuthStore();

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [setProfile]);

  // Fetch user settings
  const fetchUserSettings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  }, [setSettings]);

  // Initialize auth state
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Fetch user profile and settings
        await Promise.all([
          fetchUserProfile(session.user.id),
          fetchUserSettings(session.user.id),
        ]);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setLoading, setInitialized, setSession, setUser, fetchUserProfile, fetchUserSettings]);

  // Sign in with email and password
  const signIn = useCallback(async (credentials: SignInWithPasswordCredentials) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        
        // Fetch user data
        await Promise.all([
          fetchUserProfile(data.user.id),
          fetchUserSettings(data.user.id),
        ]);

        toast.success('Successfully signed in!');
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, setSession, fetchUserProfile, fetchUserSettings]);

  // Sign up with email and password
  const signUp = useCallback(async (credentials: SignUpWithPasswordCredentials) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp(credentials);
      
      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      if (data.user) {
        toast.success('Check your email for the confirmation link!');
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      signOutStore();
      toast.success('Successfully signed out!');
      router.push('/');
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [setLoading, signOutStore, router]);

  // Sign in with OAuth provider
  const signInWithProvider = useCallback(async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Omit<typeof profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { success: false, error: new Error('No user found') };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      setProfile(data);
      toast.success('Profile updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    }
  }, [user, setProfile]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        switch (event) {
          case 'SIGNED_IN':
            if (session) {
              setUser(session.user);
              setSession(session);
              await Promise.all([
                fetchUserProfile(session.user.id),
                fetchUserSettings(session.user.id),
              ]);
            }
            break;
          
          case 'SIGNED_OUT':
            signOutStore();
            break;
          
          case 'TOKEN_REFRESHED':
            if (session) {
              setSession(session);
            }
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, signOutStore, fetchUserProfile, fetchUserSettings]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    // State
    user,
    session,
    profile,
    settings,
    isLoading,
    isInitialized,
    isAuthenticated: !!user && !!session,

    // Actions
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    updateProfile,
    initialize,
  };
}
