import { useState, useEffect } from 'react';
import { diContainer } from '@/src/shared';
import { Bank, Institution } from '@/src/shared';

/**
 * Bank management hook using clean architecture
 * Provides bank connection and management functionality
 */
export function useBanks(userId?: string) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bankUseCases = diContainer.bankUseCases;

  // Load user banks
  const loadBanks = async (userIdParam?: string) => {
    if (!userIdParam && !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userBanks = await bankUseCases.getUserBanks(userIdParam || userId!);
      setBanks(userBanks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load banks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load institutions by country
  const loadInstitutionsByCountry = async (countryCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const countryInstitutions = await bankUseCases.getInstitutionsByCountry(countryCode);
      setInstitutions(countryInstitutions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load banks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Search institutions
  const searchInstitutions = async (query: string, countryCode?: string) => {
    if (!query.trim()) {
      setInstitutions([]);
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await bankUseCases.searchInstitutions(query, countryCode);
      setInstitutions(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Connect bank
  const connectBank = async (institutionId: string, redirectUrl: string) => {
    if (!userId) throw new Error('User ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await bankUseCases.connectBank({
        institutionId,
        userId,
        redirectUrl,
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect bank';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete bank connection
  const completeBankConnection = async (requisitionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const bank = await bankUseCases.completeBankConnection(requisitionId);
      
      // Refresh banks list
      if (userId) {
        await loadBanks(userId);
      }
      
      return bank;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete connection';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect bank
  const disconnectBank = async (bankId: string) => {
    if (!userId) throw new Error('User ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      await bankUseCases.disconnectBank(bankId, userId);
      
      // Refresh banks list
      await loadBanks(userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect bank';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync bank data
  const syncBankData = async (bankId: string) => {
    if (!userId) throw new Error('User ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      await bankUseCases.syncBankData(bankId, userId);
      
      // Refresh banks list
      await loadBanks(userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync bank data';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load banks on mount if userId is provided
  useEffect(() => {
    if (userId) {
      loadBanks(userId);
    }
  }, [userId]);

  return {
    banks,
    institutions,
    isLoading,
    error,
    loadBanks,
    loadInstitutionsByCountry,
    searchInstitutions,
    connectBank,
    completeBankConnection,
    disconnectBank,
    syncBankData,
    refreshBanks: () => userId ? loadBanks(userId) : Promise.resolve(),
  };
}