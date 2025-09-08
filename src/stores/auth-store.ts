import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile, UserSettings } from '@/lib/supabase';

interface AuthState {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  session: null,
  profile: null,
  settings: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (set, get) => ({
        ...initialState,

        setUser: (user) => {
          set({ user }, false, 'setUser');
        },

        setSession: (session) => {
          set({ session }, false, 'setSession');
        },

        setProfile: (profile) => {
          set({ profile }, false, 'setProfile');
        },

        setSettings: (settings) => {
          set({ settings }, false, 'setSettings');
        },

        setLoading: (isLoading) => {
          set({ isLoading }, false, 'setLoading');
        },

        setInitialized: (isInitialized) => {
          set({ isInitialized }, false, 'setInitialized');
        },

        signOut: () => {
          set({
            user: null,
            session: null,
            profile: null,
            settings: null,
          }, false, 'signOut');
        },

        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'hydra-auth-storage',
        partialize: (state) => ({
          // Only persist non-sensitive data
          isInitialized: state.isInitialized,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useSettings = () => useAuthStore((state) => state.settings);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);

// Computed selectors
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user && !!state.session);
export const useUserEmail = () => useAuthStore((state) => state.user?.email);
export const useDisplayName = () => useAuthStore((state) => 
  state.profile?.display_name || state.user?.email?.split('@')[0] || 'User'
);
