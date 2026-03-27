import { Transaction, TransactionFilters } from '../../core/entities/transaction.entity';
import { TransactionRepository } from '../../core/repositories/transaction.repository';
import { StorageRepository } from '../../core/repositories/storage.repository';

/**
 * Local storage implementation of TransactionRepository
 * Stores transaction data in device storage for offline access
 */
export class LocalTransactionRepository implements TransactionRepository {
  private readonly TRANSACTIONS_KEY = 'transactions';

  constructor(private storageRepository: StorageRepository) {}

  /**
   * Get transactions with optional filters
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Get all transactions from all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const transactionKeys = allKeys.filter(key => key.startsWith(this.TRANSACTIONS_KEY));
      
      let allTransactions: Transaction[] = [];
      
      for (const key of transactionKeys) {
        const transactionsJson = await this.storageRepository.getItem(key);
        if (transactionsJson) {
          const transactions: Transaction[] = JSON.parse(transactionsJson);
          allTransactions = allTransactions.concat(transactions);
        }
      }
      
      return this.applyFilters(allTransactions, filters);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific user
   */
  async getUserTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const transactionsJson = await this.storageRepository.getItem(`${this.TRANSACTIONS_KEY}_${userId}`);
      if (!transactionsJson) return [];
      
      const transactions: Transaction[] = JSON.parse(transactionsJson);
      return this.applyFilters(transactions, filters);
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      return [];
    }
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      // Search through all user transactions (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const transactionKeys = allKeys.filter(key => key.startsWith(this.TRANSACTIONS_KEY));
      
      for (const key of transactionKeys) {
        const transactionsJson = await this.storageRepository.getItem(key);
        if (transactionsJson) {
          const transactions: Transaction[] = JSON.parse(transactionsJson);
          const transaction = transactions.find(t => t.id === transactionId);
          if (transaction) return transaction;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      // For this implementation, we need a userId to associate the transaction
      // In a real app, this would come from the current user context
      const userId = 'current_user'; // This should be injected or retrieved from context
      
      const transactions = await this.getUserTransactions(userId);
      transactions.push(transaction);
      
      await this.storageRepository.setItem(`${this.TRANSACTIONS_KEY}_${userId}`, JSON.stringify(transactions));
      return transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      // Find and update transaction across all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const transactionKeys = allKeys.filter(key => key.startsWith(this.TRANSACTIONS_KEY));
      
      for (const key of transactionKeys) {
        const transactionsJson = await this.storageRepository.getItem(key);
        if (transactionsJson) {
          const transactions: Transaction[] = JSON.parse(transactionsJson);
          const transactionIndex = transactions.findIndex(t => t.id === transactionId);
          
          if (transactionIndex >= 0) {
            transactions[transactionIndex] = { ...transactions[transactionIndex], ...updates };
            await this.storageRepository.setItem(key, JSON.stringify(transactions));
            return transactions[transactionIndex];
          }
        }
      }
      
      throw new Error('Transaction not found');
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      // Find and delete transaction across all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const transactionKeys = allKeys.filter(key => key.startsWith(this.TRANSACTIONS_KEY));
      
      for (const key of transactionKeys) {
        const transactionsJson = await this.storageRepository.getItem(key);
        if (transactionsJson) {
          const transactions: Transaction[] = JSON.parse(transactionsJson);
          const filteredTransactions = transactions.filter(t => t.id !== transactionId);
          
          if (filteredTransactions.length !== transactions.length) {
            await this.storageRepository.setItem(key, JSON.stringify(filteredTransactions));
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  /**
   * Bulk create transactions
   */
  async createTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      // For this implementation, we need a userId to associate the transactions
      const userId = 'current_user'; // This should be injected or retrieved from context
      
      const existingTransactions = await this.getUserTransactions(userId);
      const allTransactions = existingTransactions.concat(transactions);
      
      await this.storageRepository.setItem(`${this.TRANSACTIONS_KEY}_${userId}`, JSON.stringify(allTransactions));
      return transactions;
    } catch (error) {
      console.error('Failed to create transactions:', error);
      throw new Error('Failed to create transactions');
    }
  }

  /**
   * Get transactions by bank ID
   */
  async getTransactionsByBank(bankId: string): Promise<Transaction[]> {
    try {
      const filters: TransactionFilters = { bankId };
      return await this.getTransactions(filters);
    } catch (error) {
      console.error('Failed to get transactions by bank:', error);
      return [];
    }
  }

  /**
   * Get transactions by counterparty
   */
  async getTransactionsByCounterparty(counterpartyId: string): Promise<Transaction[]> {
    try {
      const filters: TransactionFilters = { counterpartyId };
      return await this.getTransactions(filters);
    } catch (error) {
      console.error('Failed to get transactions by counterparty:', error);
      return [];
    }
  }

  /**
   * Search transactions by text
   */
  async searchTransactions(searchTerm: string, userId?: string): Promise<Transaction[]> {
    try {
      const filters: TransactionFilters = { searchTerm: searchTerm.toLowerCase() };
      
      if (userId) {
        return await this.getUserTransactions(userId, filters);
      } else {
        return await this.getTransactions(filters);
      }
    } catch (error) {
      console.error('Failed to search transactions:', error);
      return [];
    }
  }

  /**
   * Apply filters to transactions
   */
  private applyFilters(transactions: Transaction[], filters?: TransactionFilters): Transaction[] {
    if (!filters) return transactions;

    return transactions.filter(transaction => {
      // Bank ID filter
      if (filters.bankId && transaction.bankId !== filters.bankId) {
        return false;
      }

      // Account ID filter
      if (filters.accountId && transaction.accountId !== filters.accountId) {
        return false;
      }

      // Transaction type filter
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      // Counterparty filter
      if (filters.counterpartyId && transaction.counterpartyId !== filters.counterpartyId) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) {
          return false;
        }
      }

      // Amount range filter
      if (filters.amountMin && transaction.amount < filters.amountMin) {
        return false;
      }

      if (filters.amountMax && transaction.amount > filters.amountMax) {
        return false;
      }

      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!transaction.tags || !filters.tags.some(tag => transaction.tags!.includes(tag))) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDescription = transaction.description.toLowerCase().includes(searchLower);
        const matchesCounterparty = transaction.counterpartyName.toLowerCase().includes(searchLower);
        const matchesReference = transaction.reference?.toLowerCase().includes(searchLower);
        
        if (!matchesDescription && !matchesCounterparty && !matchesReference) {
          return false;
        }
      }

      return true;
    });
  }
}