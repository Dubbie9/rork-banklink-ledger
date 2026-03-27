export interface Bank {
  id: string;
  name: string;
  color: string;
  logoUrl: string; // Added logoUrl field
  accountNumber?: string;
  lastUpdated?: string;
  transactionCount?: number;
}

export interface Transaction {
  id: string;
  bankId: string;
  amount: number;
  date: string;
  description: string;
  type: "incoming" | "outgoing";
  counterpartyId: string;
  counterpartyName: string;
  reference?: string;
}

export interface Counterparty {
  id: string;
  name: string;
  totalSent: number;
  totalReceived: number;
  netPosition: number;
}