import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile, UserRole } from '../types';
import { portalApi } from '../services/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: Partial<Profile>, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const current = await portalApi.getCurrentUser();
      setUser(current);
    } catch (err) {
      console.error('Failed to load user session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    const handleAuthStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<Profile | null>;
      setUser(customEvent.detail || null);
    };

    window.addEventListener('egspec_auth_state_change', handleAuthStateChange);
    return () => {
      window.removeEventListener('egspec_auth_state_change', handleAuthStateChange);
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await portalApi.signIn(email, password);
      if (res.error) {
        return { success: false, error: res.error };
      }
      setUser(res.user);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Partial<Profile>, password?: string) => {
    setIsLoading(true);
    try {
      const res = await portalApi.signUp(userData, password);
      if (res.error) {
        return { success: false, error: res.error };
      }
      setUser(res.user);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await portalApi.signOut();
    setUser(null);
  };

  const switchDemoRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const targetUser = await portalApi.switchDemoUser(newRole);
      setUser(targetUser);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const current = await portalApi.getCurrentUser();
    setUser(current);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
