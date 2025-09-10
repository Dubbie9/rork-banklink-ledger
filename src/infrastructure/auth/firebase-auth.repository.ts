import { Platform } from 'react-native';
import { v4 as uuidv4 } from '@/utils/uuid';
import { User, CreateUserData, LoginCredentials } from '../../core/entities/user.entity';
import { AuthRepository } from '../../core/repositories/auth.repository';
import { StorageRepository } from '../../core/repositories/storage.repository';

/**
 * Firebase Auth implementation (currently mocked for demo)
 * In production, this would integrate with actual Firebase SDK
 */
export class FirebaseAuthRepository implements AuthRepository {
  constructor(private storageRepository: StorageRepository) {}

  /**
   * Login user with email and password
   */
  async loginWithEmail(credentials: LoginCredentials): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation for demo
    if (!credentials.email.includes('@') || credentials.password.length < 6) {
      throw new Error('Invalid email or password');
    }
    
    // Extract first name from email for demo
    const emailName = credentials.email.split('@')[0];
    const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    
    const user: User = {
      uid: uuidv4(),
      email: credentials.email,
      displayName: firstName,
      firstName,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    
    return user;
  }

  /**
   * Create a new user account
   */
  async createUser(userData: CreateUserData): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation for demo
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (userData.password && userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const user: User = {
      uid: uuidv4(),
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      provider: userData.provider,
      createdAt: new Date().toISOString(),
    };
    
    return user;
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Platform.OS === 'web') {
      // Mock Google user data for web
      const mockGoogleUser = {
        email: 'user@gmail.com',
        displayName: 'John Doe',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };
      
      const firstName = mockGoogleUser.displayName.split(' ')[0];
      
      return {
        uid: uuidv4(),
        email: mockGoogleUser.email,
        displayName: mockGoogleUser.displayName,
        firstName,
        photoURL: mockGoogleUser.photoURL,
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
    } else {
      // For mobile, this would integrate with actual Google Sign-In
      // For now, simulate the process
      const mockGoogleUser = {
        email: 'user@gmail.com',
        displayName: 'John Doe',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };
      
      const firstName = mockGoogleUser.displayName.split(' ')[0];
      
      return {
        uid: uuidv4(),
        email: mockGoogleUser.email,
        displayName: mockGoogleUser.displayName,
        firstName,
        photoURL: mockGoogleUser.photoURL,
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would call Firebase Auth signOut
    console.log('User logged out from Firebase');
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // In production, this would call Firebase Auth sendPasswordResetEmail
    console.log('Password reset email sent to:', email);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const userJson = await this.storageRepository.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Refresh user authentication token
   */
  async refreshToken(): Promise<string> {
    // Simulate token refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would refresh the Firebase Auth token
    return 'mock_refreshed_token_' + Date.now();
  }

  /**
   * Verify user authentication status
   */
  async verifyAuth(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}