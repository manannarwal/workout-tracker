import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  hasCompletedOnboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = '@auth_current_user';
const CREDENTIALS_PREFIX = 'cred_';
const USER_PROFILE_PREFIX = 'profile_';

// Helper function to sanitize email for SecureStore key
// SecureStore keys must contain only alphanumeric characters, ".", "-", and "_"
const sanitizeEmail = (email: string): string => {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
      console.log('LoadUser - Raw data from storage:', userJson);
      if (userJson) {
        const userData = JSON.parse(userJson);
        console.log('LoadUser - Parsed user data:', userData);
        setUser(userData);
      } else {
        console.log('LoadUser - No user data found');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const sanitizedKey = sanitizeEmail(normalizedUsername);
      
      // Check if username already exists
      const existingCreds = await SecureStore.getItemAsync(`${CREDENTIALS_PREFIX}${sanitizedKey}`);
      if (existingCreds) {
        return { success: false, error: 'Username already exists' };
      }

      // Store credentials securely
      await SecureStore.setItemAsync(`${CREDENTIALS_PREFIX}${sanitizedKey}`, password);

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username: normalizedUsername,
        hasCompletedOnboarding: false,
      };

      // Save user to AsyncStorage with @ prefix for consistency
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(`@${USER_PROFILE_PREFIX}${normalizedUsername}`, JSON.stringify(newUser));
      
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const signIn = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const sanitizedKey = sanitizeEmail(normalizedUsername);
      
      // Get stored password
      const storedPassword = await SecureStore.getItemAsync(`${CREDENTIALS_PREFIX}${sanitizedKey}`);
      
      if (!storedPassword) {
        return { success: false, error: 'Username not found' };
      }

      if (storedPassword !== password) {
        return { success: false, error: 'Incorrect password' };
      }

      // Load user profile from AsyncStorage
      // Try with @ prefix first (used in AsyncStorage keys)
      let profileJson = await AsyncStorage.getItem(`@${USER_PROFILE_PREFIX}${normalizedUsername}`);
      
      console.log('Login - Loading profile for:', normalizedUsername);
      console.log('Profile key:', `@${USER_PROFILE_PREFIX}${normalizedUsername}`);
      console.log('Profile data found:', profileJson);
      
      // If not found, try without @ prefix
      if (!profileJson) {
        profileJson = await AsyncStorage.getItem(`${USER_PROFILE_PREFIX}${normalizedUsername}`);
        console.log('Tried without @ prefix:', profileJson);
      }
      
      let userData: User;
      if (profileJson) {
        userData = JSON.parse(profileJson);
        console.log('Parsed user data:', userData);
      } else {
        // If no profile found, create a basic one
        console.log('No profile found, creating basic user');
        userData = {
          id: normalizedUsername,
          username: normalizedUsername,
          hasCompletedOnboarding: false,
        };
      }

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData };
      console.log('UpdateUser - Saving to:', AUTH_USER_KEY);
      console.log('UpdateUser - Saving to:', `@${USER_PROFILE_PREFIX}${user.username}`);
      console.log('UpdateUser - Data:', updatedUser);
      
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(`@${USER_PROFILE_PREFIX}${user.username}`, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const completeOnboarding = async () => {
    await updateUser({ hasCompletedOnboarding: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        updateUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
