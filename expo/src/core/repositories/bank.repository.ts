import { Bank, BankConnection, BankAccount } from '../entities/bank.entity';

/**
 * Bank repository interface
 * Defines the contract for bank data access
 */
export interface BankRepository {
  /**
   * Get all banks for a user
   */
  getUserBanks(userId: string): Promise<Bank[]>;

  /**
   * Get a specific bank by ID
   */
  getBank(bankId: string): Promise<Bank | null>;

  /**
   * Save a bank record
   */
  saveBank(bank: Bank): Promise<Bank>;

  /**
   * Remove a bank
   */
  removeBank(bankId: string, userId: string): Promise<void>;

  /**
   * Get bank connection details
   */
  getBankConnection(bankId: string, userId: string): Promise<BankConnection | null>;

  /**
   * Save bank connection
   */
  saveBankConnection(connection: BankConnection): Promise<BankConnection>;

  /**
   * Update connection status
   */
  updateConnectionStatus(connectionId: string, status: BankConnection['status']): Promise<void>;

  /**
   * Update last sync time
   */
  updateLastSync(connectionId: string, lastSyncAt: string): Promise<void>;

  /**
   * Remove bank connection
   */
  removeBankConnection(connectionId: string): Promise<void>;

  /**
   * Get bank accounts
   */
  getBankAccounts(bankId: string): Promise<BankAccount[]>;

  /**
   * Save bank account
   */
  saveBankAccount(account: BankAccount): Promise<BankAccount>;
}