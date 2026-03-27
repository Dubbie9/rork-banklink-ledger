import { useState, useEffect } from 'react';
import { diContainer } from '@/src/shared';
import { User, AuthState } from '@/src/shared';

/**
 * Authentication hook using clean architecture
 * Provides authentication state and actions
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  const authUseCases = diContainer.authUseCases;

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authUseCases.getCurrentUser();
        setState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: !!user,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load user',
          isAuthenticated: false,
        });
      }
    };

    loadUser();
  }, [authUseCases]);

  const login = async (email: string, password: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authUseCases.loginWithEmail({ email, password });
      setState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const firstName = displayName.split(' ')[0];
      const lastName = displayName.split(' ').slice(1).join(' ');
      
      const user = await authUseCases.registerUser({
        email,
        password,
        displayName,
        firstName,
        lastName,
        provider: 'email',
      });
      
      setState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authUseCases.loginWithGoogle();
      setState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authUseCases.logout();
      setState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authUseCases.resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const setPin = async (pin: string): Promise<void> => {
    try {
      await authUseCases.setPin(pin);
    } catch (error) {
      throw error;
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      return await authUseCases.verifyPin(pin);
    } catch (error) {
      throw error;
    }
  };

  const hasPin = async (): Promise<boolean> => {
    try {
      return await authUseCases.hasPin();
    } catch (error) {
      return false;
    }
  };

  return {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    setPin,
    verifyPin,
    hasPin,
  };
}