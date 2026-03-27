import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "@/types";

interface TransactionsState {
  transactions: Transaction[];
  addTransactions: (transactions: Transaction[]) => void;
  removeTransactionsByBank: (bankId: string) => void;
  clearAllTransactions: () => void;
  getTransactionsByCounterparty: (counterpartyId: string) => Transaction[];
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransactions: (newTransactions) => {
        const { transactions } = get();
        
        // Filter out duplicates by transaction ID
        const existingIds = new Set(transactions.map(t => t.id));
        const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t.id));
        
        if (uniqueNewTransactions.length > 0) {
          set({ transactions: [...transactions, ...uniqueNewTransactions] });
        }
      },
      removeTransactionsByBank: (bankId) => {
        const { transactions } = get();
        set({ transactions: transactions.filter((tx) => tx.bankId !== bankId) });
      },
      clearAllTransactions: () => {
        set({ transactions: [] });
      },
      getTransactionsByCounterparty: (counterpartyId) => {
        const { transactions } = get();
        return transactions.filter((tx) => tx.counterpartyId === counterpartyId);
      },
    }),
    {
      name: "banklink-transactions",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useTransactions() {
  const { 
    transactions, 
    addTransactions, 
    removeTransactionsByBank, 
    clearAllTransactions,
    getTransactionsByCounterparty
  } = useTransactionsStore();
  
  return {
    transactions,
    addTransactions,
    removeTransactionsByBank,
    clearAllTransactions,
    getTransactionsByCounterparty,
  };
}