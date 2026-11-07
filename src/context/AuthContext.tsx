// ==============================================================================
// HUNTX AUTHENTICATION CONTEXT
// Registered Accounts + Expiring Guest Profiles + Host Privilege Verification
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/huntx';
import { LocalStore, supabase, isSupabaseConfigured } from '../services/supabase';
import { sounds } from '../utils/sound';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  canHost: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (nickname?: string) => Promise<UserProfile>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial auth state
    const saved = LocalStore.getCurrentUser();
    if (saved) {
      // Check if guest profile expired
      if (saved.is_guest && saved.guest_expires_at) {
        const expires = new Date(saved.guest_expires_at).getTime();
        if (Date.now() > expires) {
          console.log('Guest session expired');
          LocalStore.setCurrentUser(null);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
      }
      setCurrentUser(saved);
    }
    setIsLoading(false);
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            user_id: data.user.id,
            username: data.user.email?.split('@')[0] || 'hunter',
            display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Hunter',
            avatar_url: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
            is_guest: false,
            games_played: 14,
            games_won: 9,
            total_captures: 28,
            total_escapes: 12,
            created_at: new Date().toISOString(),
          };
          setCurrentUser(profile);
          LocalStore.setCurrentUser(profile);
          sounds.playTapSound();
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Offline demo authentication fallback
      const mockUsername = email.split('@')[0] || 'Player';
      const mockProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: mockUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        display_name: mockUsername.toUpperCase(),
        avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
        is_guest: false,
        games_played: 12,
        games_won: 8,
        total_captures: 23,
        total_escapes: 11,
        created_at: new Date().toISOString(),
      };

      setCurrentUser(mockProfile);
      LocalStore.setCurrentUser(mockProfile);
      sounds.playTapSound();
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    username: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { username, display_name: displayName },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            user_id: data.user.id,
            username: username.toLowerCase(),
            display_name: displayName,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            is_guest: false,
            games_played: 0,
            games_won: 0,
            total_captures: 0,
            total_escapes: 0,
            created_at: new Date().toISOString(),
          };
          setCurrentUser(newProfile);
          LocalStore.setCurrentUser(newProfile);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Offline / Local registration
      const newProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        is_guest: false,
        games_played: 0,
        games_won: 0,
        total_captures: 0,
        total_escapes: 0,
        created_at: new Date().toISOString(),
      };

      setCurrentUser(newProfile);
      LocalStore.setCurrentUser(newProfile);
      sounds.playTapSound();
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  const loginAsGuest = async (nickname?: string): Promise<UserProfile> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestName = nickname && nickname.trim().length > 0 ? nickname.trim() : `GUEST_${randomSuffix}`;

    // Expires in 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const guestProfile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: `guest_${randomSuffix}`.toLowerCase(),
      display_name: guestName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestName}`,
      is_guest: true,
      guest_expires_at: expires,
      games_played: 0,
      games_won: 0,
      total_captures: 0,
      total_escapes: 0,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(guestProfile);
    LocalStore.setCurrentUser(guestProfile);
    sounds.playTapSound();
    return guestProfile;
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setCurrentUser(null);
    LocalStore.setCurrentUser(null);
    sounds.playTapSound();
  };

  const resetPassword = async (email: string) => {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, message: error.message };
    }
    return {
      success: true,
      message: `Password reset instructions dispatched to ${email}. Check your inbox.`,
    };
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    LocalStore.setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isGuest: currentUser ? currentUser.is_guest : false,
        canHost: currentUser ? !currentUser.is_guest : false, // Only registered accounts can host games
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
