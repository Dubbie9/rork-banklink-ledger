/**
 * Application configuration constants
 */
export const AppConfig = {
  // App information
  APP_NAME: 'BankLink Ledger',
  APP_VERSION: '1.0.0',
  
  // API configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  API_TIMEOUT: 30000, // 30 seconds
  
  // GoCardless configuration
  GOCARDLESS_SECRET_ID: process.env.GOCARDLESS_SECRET_ID || '',
  GOCARDLESS_SECRET_KEY: process.env.GOCARDLESS_SECRET_KEY || '',
  GOCARDLESS_BASE_URL: 'https://ob.nordigen.com/api/v2',
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'user',
    PIN: 'pin',
    THEME: 'theme',
    FOLLOW_SYSTEM: 'followSystem',
    BANKS: 'banks',
    TRANSACTIONS: 'transactions',
    GOCARDLESS_TOKENS: 'gocardless-tokens',
  },
  
  // Security
  PIN_LENGTH: 4,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'DD MMM YYYY',
    API: 'YYYY-MM-DD',
    FULL: 'DD MMM YYYY HH:mm',
  },
  
  // Currency
  DEFAULT_CURRENCY: 'GBP',
  CURRENCY_LOCALE: 'en-GB',
  
  // Validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
  },
  
  // Feature flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    GOOGLE_SIGN_IN: true,
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: false,
  },
  
  // GoCardless specific
  GOCARDLESS: {
    MAX_HISTORICAL_DAYS: 90,
    ACCESS_VALID_FOR_DAYS: 90,
    DEFAULT_ACCESS_SCOPE: ['balances', 'details', 'transactions'],
    SUPPORTED_COUNTRIES: ['GB', 'IE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT'],
  },
} as const;

/**
 * Environment-specific configuration
 */
export const Environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Error messages
 */
export const ErrorMessages = {
  // Authentication
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  LOGIN_FAILED: 'Login failed. Please check your credentials',
  REGISTRATION_FAILED: 'Registration failed. Please try again',
  LOGOUT_FAILED: 'Logout failed. Please try again',
  
  // Banking
  BANK_CONNECTION_FAILED: 'Failed to connect to bank',
  BANK_SYNC_FAILED: 'Failed to sync bank data',
  INSTITUTION_LOAD_FAILED: 'Failed to load available banks',
  
  // Transactions
  TRANSACTION_LOAD_FAILED: 'Failed to load transactions',
  TRANSACTION_CREATE_FAILED: 'Failed to create transaction',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  
  // General
  UNKNOWN_ERROR: 'An unexpected error occurred',
  VALIDATION_ERROR: 'Please check your input and try again',
} as const;

/**
 * Success messages
 */
export const SuccessMessages = {
  LOGIN_SUCCESS: 'Successfully logged in',
  REGISTRATION_SUCCESS: 'Account created successfully',
  BANK_CONNECTED: 'Bank connected successfully',
  BANK_DISCONNECTED: 'Bank disconnected successfully',
  DATA_SYNCED: 'Data synced successfully',
  TRANSACTION_CREATED: 'Transaction created successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;