import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, checkIsAdmin } from '../lib/supabase';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      // Offline/Local check for development mode
      const isLocalAuth = localStorage.getItem('cnc_admin_authenticated') === 'true';
      if (isLocalAuth) {
        setIsAdmin(true);
      }
      setLoading(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await checkIsAdmin(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const hasAdminRole = await checkIsAdmin(newSession.user.id);
          setIsAdmin(hasAdminRole);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();

    // 1. If Supabase is connected, use real Supabase Auth + RLS role verification
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: 'Authentication failed. Please check your credentials.' };
        }

        // Verify admin role in user_roles table
        const hasAdminRole = await checkIsAdmin(data.user.id);
        if (!hasAdminRole) {
          // Immediately sign out unauthorized user
          await supabase.auth.signOut();
          setIsAdmin(false);
          setUser(null);
          setSession(null);
          return {
            success: false,
            error: 'Access Denied: Your account does not have administrator privileges for Cake N Crave.',
          };
        }

        setUser(data.user);
        setSession(data.session);
        setIsAdmin(true);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
      }
    }

    // 2. Fallback when Supabase env vars are not yet configured in Vite
    // Allows admin to set up or access local sandbox until Supabase credentials are provided
    if (email === 'admin@cakencrave.com' && password === 'JaipurCakes@2026') {
      localStorage.setItem('cnc_admin_authenticated', 'true');
      setIsAdmin(true);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. (Or connect your Supabase project in Website Settings below)',
    };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('cnc_admin_authenticated');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signIn,
        signOut,
        isConfigured,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
