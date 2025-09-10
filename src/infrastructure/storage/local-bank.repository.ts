import { Bank, BankConnection, BankAccount } from '../../core/entities/bank.entity';
import { BankRepository } from '../../core/repositories/bank.repository';
import { StorageRepository } from '../../core/repositories/storage.repository';

/**
 * Local storage implementation of BankRepository
 * Stores bank data in device storage for offline access
 */
export class LocalBankRepository implements BankRepository {
  private readonly BANKS_KEY = 'banks';
  private readonly CONNECTIONS_KEY = 'bank_connections';
  private readonly ACCOUNTS_KEY = 'bank_accounts';

  constructor(private storageRepository: StorageRepository) {}

  /**
   * Get all banks for a user
   */
  async getUserBanks(userId: string): Promise<Bank[]> {
    try {
      const banksJson = await this.storageRepository.getItem(`${this.BANKS_KEY}_${userId}`);
      if (!banksJson) return [];
      
      return JSON.parse(banksJson);
    } catch (error) {
      console.error('Failed to get user banks:', error);
      return [];
    }
  }

  /**
   * Get a specific bank by ID
   */
  async getBank(bankId: string): Promise<Bank | null> {
    try {
      // For simplicity, we'll search through all user banks
      // In production, you might want a more efficient approach
      const allKeys = await this.storageRepository.getAllKeys();
      const bankKeys = allKeys.filter(key => key.startsWith(this.BANKS_KEY));
      
      for (const key of bankKeys) {
        const banksJson = await this.storageRepository.getItem(key);
        if (banksJson) {
          const banks: Bank[] = JSON.parse(banksJson);
          const bank = banks.find(b => b.id === bankId);
          if (bank) return bank;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get bank:', error);
      return null;
    }
  }

  /**
   * Save a bank record
   */
  async saveBank(bank: Bank): Promise<Bank> {
    try {
      // For this implementation, we need a userId to associate the bank
      // In a real app, this would come from the current user context
      const userId = 'current_user'; // This should be injected or retrieved from context
      
      const banks = await this.getUserBanks(userId);
      const existingIndex = banks.findIndex(b => b.id === bank.id);
      
      if (existingIndex >= 0) {
        banks[existingIndex] = { ...banks[existingIndex], ...bank };
      } else {
        banks.push(bank);
      }
      
      await this.storageRepository.setItem(`${this.BANKS_KEY}_${userId}`, JSON.stringify(banks));
      return bank;
    } catch (error) {
      console.error('Failed to save bank:', error);
      throw new Error('Failed to save bank');
    }
  }

  /**
   * Remove a bank
   */
  async removeBank(bankId: string, userId: string): Promise<void> {
    try {
      const banks = await this.getUserBanks(userId);
      const filteredBanks = banks.filter(b => b.id !== bankId);
      
      await this.storageRepository.setItem(`${this.BANKS_KEY}_${userId}`, JSON.stringify(filteredBanks));
    } catch (error) {
      console.error('Failed to remove bank:', error);
      throw new Error('Failed to remove bank');
    }
  }

  /**
   * Get bank connection details
   */
  async getBankConnection(bankId: string, userId: string): Promise<BankConnection | null> {
    try {
      const connectionsJson = await this.storageRepository.getItem(`${this.CONNECTIONS_KEY}_${userId}`);
      if (!connectionsJson) return null;
      
      const connections: BankConnection[] = JSON.parse(connectionsJson);
      return connections.find(c => c.bankId === bankId && c.userId === userId) || null;
    } catch (error) {
      console.error('Failed to get bank connection:', error);
      return null;
    }
  }

  /**
   * Save bank connection
   */
  async saveBankConnection(connection: BankConnection): Promise<BankConnection> {
    try {
      const connectionsJson = await this.storageRepository.getItem(`${this.CONNECTIONS_KEY}_${connection.userId}`);
      const connections: BankConnection[] = connectionsJson ? JSON.parse(connectionsJson) : [];
      
      const existingIndex = connections.findIndex(c => c.id === connection.id);
      
      if (existingIndex >= 0) {
        connections[existingIndex] = { ...connections[existingIndex], ...connection };
      } else {
        connections.push(connection);
      }
      
      await this.storageRepository.setItem(`${this.CONNECTIONS_KEY}_${connection.userId}`, JSON.stringify(connections));
      return connection;
    } catch (error) {
      console.error('Failed to save bank connection:', error);
      throw new Error('Failed to save bank connection');
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(connectionId: string, status: BankConnection['status']): Promise<void> {
    try {
      // Find and update connection across all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const connectionKeys = allKeys.filter(key => key.startsWith(this.CONNECTIONS_KEY));
      
      for (const key of connectionKeys) {
        const connectionsJson = await this.storageRepository.getItem(key);
        if (connectionsJson) {
          const connections: BankConnection[] = JSON.parse(connectionsJson);
          const connectionIndex = connections.findIndex(c => c.id === connectionId);
          
          if (connectionIndex >= 0) {
            connections[connectionIndex].status = status;
            await this.storageRepository.setItem(key, JSON.stringify(connections));
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to update connection status:', error);
      throw new Error('Failed to update connection status');
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSync(connectionId: string, lastSyncAt: string): Promise<void> {
    try {
      // Find and update connection across all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const connectionKeys = allKeys.filter(key => key.startsWith(this.CONNECTIONS_KEY));
      
      for (const key of connectionKeys) {
        const connectionsJson = await this.storageRepository.getItem(key);
        if (connectionsJson) {
          const connections: BankConnection[] = JSON.parse(connectionsJson);
          const connectionIndex = connections.findIndex(c => c.id === connectionId);
          
          if (connectionIndex >= 0) {
            connections[connectionIndex].lastSyncAt = lastSyncAt;
            await this.storageRepository.setItem(key, JSON.stringify(connections));
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to update last sync time:', error);
      throw new Error('Failed to update sync time');
    }
  }

  /**
   * Remove bank connection
   */
  async removeBankConnection(connectionId: string): Promise<void> {
    try {
      // Find and remove connection across all users (simplified approach)
      const allKeys = await this.storageRepository.getAllKeys();
      const connectionKeys = allKeys.filter(key => key.startsWith(this.CONNECTIONS_KEY));
      
      for (const key of connectionKeys) {
        const connectionsJson = await this.storageRepository.getItem(key);
        if (connectionsJson) {
          const connections: BankConnection[] = JSON.parse(connectionsJson);
          const filteredConnections = connections.filter(c => c.id !== connectionId);
          
          if (filteredConnections.length !== connections.length) {
            await this.storageRepository.setItem(key, JSON.stringify(filteredConnections));
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to remove bank connection:', error);
      throw new Error('Failed to remove connection');
    }
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(bankId: string): Promise<BankAccount[]> {
    try {
      const accountsJson = await this.storageRepository.getItem(`${this.ACCOUNTS_KEY}_${bankId}`);
      if (!accountsJson) return [];
      
      return JSON.parse(accountsJson);
    } catch (error) {
      console.error('Failed to get bank accounts:', error);
      return [];
    }
  }

  /**
   * Save bank account
   */
  async saveBankAccount(account: BankAccount): Promise<BankAccount> {
    try {
      const accounts = await this.getBankAccounts(account.bankId);
      const existingIndex = accounts.findIndex(a => a.id === account.id);
      
      if (existingIndex >= 0) {
        accounts[existingIndex] = { ...accounts[existingIndex], ...account };
      } else {
        accounts.push(account);
      }
      
      await this.storageRepository.setItem(`${this.ACCOUNTS_KEY}_${account.bankId}`, JSON.stringify(accounts));
      return account;
    } catch (error) {
      console.error('Failed to save bank account:', error);
      throw new Error('Failed to save account');
    }
  }
}