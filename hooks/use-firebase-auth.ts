import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "@/utils/uuid";
import { Platform } from "react-native";

// Mock Firebase Auth for demo purposes
// In a real app, this would use Firebase SDK

interface User {
  uid: string;
  email: string;
  displayName: string | null;
  firstName?: string;
  photoURL?: string;
  provider?: 'email' | 'google';
}

interface FirebaseAuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Mock storage keys
const USER_STORAGE_KEY = "@banklink:firebase_user";

export function useFirebaseAuth() {
  const [state, setState] = useState<FirebaseAuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJson) {
          setState({
            user: JSON.parse(userJson),
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setState({
          user: null,
          isLoading: false,
          error: "Failed to load user",
        });
      }
    };

    loadUser();
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid email or password");
      }
      
      // Create mock user with firstName extracted from email
      const emailName = email.split("@")[0];
      const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      const user: User = {
        uid: uuidv4(),
        email,
        displayName: firstName,
        firstName,
        provider: 'email',
      };
      
      // Save to storage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      setState({
        user,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Mock signup function
  const signup = async (email: string, password: string, displayName: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple validation
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid email or password");
      }
      
      // Extract first name from display name
      const firstName = displayName.split(' ')[0];
      
      // Create mock user
      const user: User = {
        uid: uuidv4(),
        email,
        displayName,
        firstName,
        provider: 'email',
      };
      
      // Save to storage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      setState({
        user,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Mock Google Sign-In function
  const signInWithGoogle = async () => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      if (Platform.OS === 'web') {
        // For web, simulate Google sign-in
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock Google user data
        const mockGoogleUser = {
          email: 'user@gmail.com',
          displayName: 'John Doe',
          photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        };
        
        const firstName = mockGoogleUser.displayName.split(' ')[0];
        
        const user: User = {
          uid: uuidv4(),
          email: mockGoogleUser.email,
          displayName: mockGoogleUser.displayName,
          firstName,
          photoURL: mockGoogleUser.photoURL,
          provider: 'google',
        };
        
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        
        setState({
          user,
          isLoading: false,
          error: null,
        });
        
        return user;
      } else {
        // For mobile, this would integrate with actual Google Sign-In
        // For now, simulate the process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockGoogleUser = {
          email: 'user@gmail.com',
          displayName: 'John Doe',
          photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        };
        
        const firstName = mockGoogleUser.displayName.split(' ')[0];
        
        const user: User = {
          uid: uuidv4(),
          email: mockGoogleUser.email,
          displayName: mockGoogleUser.displayName,
          firstName,
          photoURL: mockGoogleUser.photoURL,
          provider: 'google',
        };
        
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        
        setState({
          user,
          isLoading: false,
          error: null,
        });
        
        return user;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed";
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Mock logout function
  const logout = async () => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from storage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Mock reset password function
  const resetPassword = async (email: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email.includes("@")) {
        throw new Error("Invalid email");
      }
      
      setState({
        ...state,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword,
  };
}