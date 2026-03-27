import { useState, useEffect } from 'react';
import { diContainer } from '@/src/shared';
import { Transaction, Counterparty, TransactionSummary, TransactionFilters } from '@/src/shared';

/**
 * Transaction management hook using clean architecture
 * Provides transaction data and operations
 */
export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transactionUseCases = diContainer.transactionUseCases;

  // Load user transactions
  const loadTransactions = async (userIdParam?: string, filters?: TransactionFilters) => {
    if (!userIdParam && !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userTransactions = await transactionUseCases.getUserTransactions(
        userIdParam || userId!,
        filters
      );
      setTransactions(userTransactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load transactions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent transactions
  const loadRecentTransactions = async (userIdParam?: string, limit: number = 10) => {
    if (!userIdParam && !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const recentTransactions = await transactionUseCases.getRecentTransactions(
        userIdParam || userId!,
        limit
      );
      setTransactions(recentTransactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recent transactions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load transaction summary
  const loadSummary = async (userIdParam?: string, dateFrom?: string, dateTo?: string) => {
    if (!userIdParam && !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transactionSummary = await transactionUseCases.getTransactionSummary(
        userIdParam || userId!,
        dateFrom,
        dateTo
      );
      setSummary(transactionSummary);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load summary';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load counterparties
  const loadCounterparties = async (userIdParam?: string) => {
    if (!userIdParam && !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userCounterparties = await transactionUseCases.getCounterparties(
        userIdParam || userId!
      );
      setCounterparties(userCounterparties);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load counterparties';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Search transactions
  const searchTransactions = async (searchTerm: string, userIdParam?: string) => {
    if (!searchTerm.trim()) {
      setTransactions([]);
      return [];
    }
    
    if (!userIdParam && !userId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await transactionUseCases.searchTransactions(
        userIdParam || userId!,
        searchTerm
      );
      setTransactions(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get counterparty details
  const getCounterparty = async (counterpartyId: string, userIdParam?: string) => {
    if (!userIdParam && !userId) return null;
    
    try {
      return await transactionUseCases.getCounterparty(
        userIdParam || userId!,
        counterpartyId
      );
    } catch (error) {
      console.error('Failed to get counterparty:', error);
      return null;
    }
  };

  // Create transaction (for manual entry)
  const createTransaction = async (data: {
    bankId: string;
    accountId: string;
    amount: number;
    description: string;
    type: 'incoming' | 'outgoing';
    counterpartyName: string;
    reference?: string;
    category?: string;
    date?: string;
  }) => {
    if (!userId) throw new Error('User ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await transactionUseCases.createTransaction(userId, data);
      
      // Refresh transactions
      await loadTransactions(userId);
      
      return transaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount if userId is provided
  useEffect(() => {
    if (userId) {
      loadTransactions(userId);
      loadCounterparties(userId);
      loadSummary(userId);
    }
  }, [userId]);

  return {
    transactions,
    counterparties,
    summary,
    isLoading,
    error,
    loadTransactions,
    loadRecentTransactions,
    loadSummary,
    loadCounterparties,
    searchTransactions,
    getCounterparty,
    createTransaction,
    refreshTransactions: () => userId ? loadTransactions(userId) : Promise.resolve(),
    refreshCounterparties: () => userId ? loadCounterparties(userId) : Promise.resolve(),
    refreshSummary: () => userId ? loadSummary(userId) : Promise.resolve(),
  };
}