import { Transaction, TransactionFilters } from '../entities/transaction.entity';

/**
 * Transaction repository interface
 * Defines the contract for transaction data access
 */
export interface TransactionRepository {
  /**
   * Get transactions with optional filters
   */
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;

  /**
   * Get transactions for a specific user
   */
  getUserTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;

  /**
   * Get a specific transaction by ID
   */
  getTransaction(transactionId: string): Promise<Transaction | null>;

  /**
   * Create a new transaction
   */
  createTransaction(transaction: Transaction): Promise<Transaction>;

  /**
   * Update an existing transaction
   */
  updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction>;

  /**
   * Delete a transaction
   */
  deleteTransaction(transactionId: string): Promise<void>;

  /**
   * Bulk create transactions
   */
  createTransactions(transactions: Transaction[]): Promise<Transaction[]>;

  /**
   * Get transactions by bank ID
   */
  getTransactionsByBank(bankId: string): Promise<Transaction[]>;

  /**
   * Get transactions by counterparty
   */
  getTransactionsByCounterparty(counterpartyId: string): Promise<Transaction[]>;

  /**
   * Search transactions by text
   */
  searchTransactions(searchTerm: string, userId?: string): Promise<Transaction[]>;
}