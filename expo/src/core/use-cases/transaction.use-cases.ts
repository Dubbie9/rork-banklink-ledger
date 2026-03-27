import { Transaction, Counterparty, TransactionSummary, TransactionFilters, CreateTransactionData } from '../entities/transaction.entity';
import { TransactionRepository } from '../repositories/transaction.repository';

/**
 * Transaction management use cases
 * Contains all business logic related to transactions and counterparties
 */
export class TransactionUseCases {
  constructor(
    private transactionRepository: TransactionRepository
  ) {}

  /**
   * Get transactions with optional filters
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    return await this.transactionRepository.getTransactions(filters);
  }

  /**
   * Get transactions for a specific user
   */
  async getUserTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return await this.transactionRepository.getUserTransactions(userId, filters);
  }

  /**
   * Get recent transactions (last 30 days)
   */
  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filters: TransactionFilters = {
      dateFrom: thirtyDaysAgo.toISOString(),
      dateTo: new Date().toISOString(),
    };

    const transactions = await this.transactionRepository.getUserTransactions(userId, filters);
    
    // Sort by date (newest first) and limit
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Get transaction summary for a user
   */
  async getTransactionSummary(userId: string, dateFrom?: string, dateTo?: string): Promise<TransactionSummary> {
    const filters: TransactionFilters = {
      dateFrom: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      dateTo: dateTo || new Date().toISOString(),
    };

    const transactions = await this.transactionRepository.getUserTransactions(userId, filters);

    const totalSent = transactions
      .filter(t => t.type === 'outgoing')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
      .filter(t => t.type === 'incoming')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalSent,
      totalReceived,
      netPosition: totalReceived - totalSent,
      transactionCount: transactions.length,
      period: {
        start: filters.dateFrom!,
        end: filters.dateTo!,
      },
    };
  }

  /**
   * Get all counterparties for a user
   */
  async getCounterparties(userId: string): Promise<Counterparty[]> {
    const transactions = await this.transactionRepository.getUserTransactions(userId);
    
    // Group transactions by counterparty
    const counterpartyMap = new Map<string, {
      name: string;
      transactions: Transaction[];
    }>();

    transactions.forEach(transaction => {
      const key = transaction.counterpartyId;
      if (!counterpartyMap.has(key)) {
        counterpartyMap.set(key, {
          name: transaction.counterpartyName,
          transactions: [],
        });
      }
      counterpartyMap.get(key)!.transactions.push(transaction);
    });

    // Calculate counterparty statistics
    const counterparties: Counterparty[] = [];
    
    counterpartyMap.forEach((data, id) => {
      const { name, transactions } = data;
      
      const totalSent = transactions
        .filter(t => t.type === 'outgoing')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalReceived = transactions
        .filter(t => t.type === 'incoming')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dates = transactions.map(t => new Date(t.date).getTime()).sort();
      
      counterparties.push({
        id,
        name,
        totalSent,
        totalReceived,
        netPosition: totalReceived - totalSent,
        transactionCount: transactions.length,
        firstTransactionDate: new Date(dates[0]).toISOString(),
        lastTransactionDate: new Date(dates[dates.length - 1]).toISOString(),
      });
    });

    // Sort by net position (highest first)
    return counterparties.sort((a, b) => Math.abs(b.netPosition) - Math.abs(a.netPosition));
  }

  /**
   * Get counterparty details
   */
  async getCounterparty(userId: string, counterpartyId: string): Promise<Counterparty | null> {
    const counterparties = await this.getCounterparties(userId);
    return counterparties.find(c => c.id === counterpartyId) || null;
  }

  /**
   * Search transactions
   */
  async searchTransactions(userId: string, searchTerm: string): Promise<Transaction[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const filters: TransactionFilters = {
      searchTerm: searchTerm.toLowerCase(),
    };

    const transactions = await this.transactionRepository.getUserTransactions(userId, filters);
    
    // Additional client-side filtering for more flexible search
    return transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  /**
   * Create a new transaction (for manual entry)
   */
  async createTransaction(userId: string, data: CreateTransactionData): Promise<Transaction> {
    // Validate transaction data
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }
    if (!data.description.trim()) {
      throw new Error('Transaction description is required');
    }
    if (!data.counterpartyName.trim()) {
      throw new Error('Counterparty name is required');
    }

    // Generate counterparty ID based on name (simple hash)
    const counterpartyId = this.generateCounterpartyId(data.counterpartyName);

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      bankId: data.bankId,
      accountId: data.accountId,
      amount: data.amount,
      date: data.date || new Date().toISOString(),
      description: data.description,
      type: data.type,
      counterpartyId,
      counterpartyName: data.counterpartyName,
      reference: data.reference,
      category: data.category,
    };

    return await this.transactionRepository.createTransaction(transaction);
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate counterparty ID from name
   */
  private generateCounterpartyId(name: string): string {
    // Simple hash function for consistent counterparty IDs
    let hash = 0;
    const normalizedName = name.toLowerCase().trim();
    for (let i = 0; i < normalizedName.length; i++) {
      const char = normalizedName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `cp_${Math.abs(hash).toString(36)}`;
  }
}