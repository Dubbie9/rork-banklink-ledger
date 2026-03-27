import { User, CreateUserData, LoginCredentials, AuthState } from '../entities/user.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { StorageRepository } from '../repositories/storage.repository';

/**
 * Authentication use cases
 * Contains all business logic related to user authentication
 */
export class AuthUseCases {
  constructor(
    private authRepository: AuthRepository,
    private storageRepository: StorageRepository
  ) {}

  /**
   * Login user with email and password
   */
  async loginWithEmail(credentials: LoginCredentials): Promise<User> {
    // Validate credentials
    if (!credentials.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Authenticate with repository
    const user = await this.authRepository.loginWithEmail(credentials);
    
    // Store user session
    await this.storageRepository.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * Register new user
   */
  async registerUser(userData: CreateUserData): Promise<User> {
    // Validate user data
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (userData.password && userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!userData.firstName.trim()) {
      throw new Error('First name is required');
    }

    // Create user
    const user = await this.authRepository.createUser(userData);
    
    // Store user session
    await this.storageRepository.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * Login with Google
   */
  async loginWithGoogle(): Promise<User> {
    const user = await this.authRepository.loginWithGoogle();
    
    // Store user session
    await this.storageRepository.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.authRepository.logout();
    await this.storageRepository.removeItem('user');
    await this.storageRepository.removeItem('pin');
  }

  /**
   * Get current user from storage
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
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    await this.authRepository.resetPassword(email);
  }

  /**
   * Set user PIN for biometric fallback
   */
  async setPin(pin: string): Promise<void> {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }
    
    await this.storageRepository.setSecureItem('pin', pin);
  }

  /**
   * Verify user PIN
   */
  async verifyPin(pin: string): Promise<boolean> {
    const storedPin = await this.storageRepository.getSecureItem('pin');
    return storedPin === pin;
  }

  /**
   * Check if user has PIN set
   */
  async hasPin(): Promise<boolean> {
    const pin = await this.storageRepository.getSecureItem('pin');
    return !!pin;
  }
}