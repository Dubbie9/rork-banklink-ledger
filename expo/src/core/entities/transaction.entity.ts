/**
 * Transaction domain entity
 * Represents a financial transaction between accounts
 */
export interface Transaction {
  id: string;
  bankId: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  counterpartyId: string;
  counterpartyName: string;
  reference?: string;
  category?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export type TransactionType = 'incoming' | 'outgoing';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
  endDate?: string;
}

/**
 * Transaction counterparty (person or organization)
 */
export interface Counterparty {
  id: string;
  name: string;
  accountNumber?: string;
  sortCode?: string;
  totalSent: number;
  totalReceived: number;
  netPosition: number;
  transactionCount: number;
  firstTransactionDate: string;
  lastTransactionDate: string;
}

/**
 * Transaction summary statistics
 */
export interface TransactionSummary {
  totalSent: number;
  totalReceived: number;
  netPosition: number;
  transactionCount: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Transaction filters for querying
 */
export interface TransactionFilters {
  bankId?: string;
  accountId?: string;
  type?: TransactionType;
  counterpartyId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  category?: string;
  tags?: string[];
  searchTerm?: string;
}

/**
 * Transaction creation data
 */
export interface CreateTransactionData {
  bankId: string;
  accountId: string;
  amount: number;
  description: string;
  type: TransactionType;
  counterpartyName: string;
  reference?: string;
  category?: string;
  date?: string; // defaults to now
}