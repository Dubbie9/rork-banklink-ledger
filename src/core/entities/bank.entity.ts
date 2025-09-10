/**
 * Bank domain entity
 * Represents a bank and its connection status
 */
export interface Bank {
  id: string;
  name: string;
  color: string;
  logoUrl: string;
  accountNumber?: string;
  lastUpdated?: string;
  transactionCount?: number;
  isConnected?: boolean;
  connectionId?: string;
}

/**
 * GoCardless institution data
 */
export interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
}

/**
 * Bank account details
 */
export interface BankAccount {
  id: string;
  bankId: string;
  accountNumber: string;
  sortCode?: string;
  accountType: 'current' | 'savings' | 'credit';
  balance: number;
  currency: string;
  isActive: boolean;
}

/**
 * Bank connection status
 */
export interface BankConnection {
  id: string;
  bankId: string;
  userId: string;
  status: 'pending' | 'connected' | 'expired' | 'error';
  requisitionId?: string;
  agreementId?: string;
  createdAt: string;
  expiresAt?: string;
  lastSyncAt?: string;
}

/**
 * Bank connection request data
 */
export interface ConnectBankRequest {
  institutionId: string;
  userId: string;
  redirectUrl: string;
}