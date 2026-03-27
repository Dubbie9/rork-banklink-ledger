import { User, CreateUserData, LoginCredentials } from '../entities/user.entity';

/**
 * Authentication repository interface
 * Defines the contract for authentication data access
 */
export interface AuthRepository {
  /**
   * Login user with email and password
   */
  loginWithEmail(credentials: LoginCredentials): Promise<User>;

  /**
   * Create a new user account
   */
  createUser(userData: CreateUserData): Promise<User>;

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): Promise<User>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Reset user password
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Refresh user authentication token
   */
  refreshToken(): Promise<string>;

  /**
   * Verify user authentication status
   */
  verifyAuth(): Promise<boolean>;
}