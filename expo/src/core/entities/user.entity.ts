/**
 * User domain entity
 * Represents a user in the system with their profile information
 */
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  provider?: 'email' | 'google';
  country?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  country: string;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * User authentication state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * User creation data for registration
 */
export interface CreateUserData {
  email: string;
  password?: string;
  displayName: string;
  firstName: string;
  lastName?: string;
  provider: 'email' | 'google';
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}