import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bank } from "@/types";
import { generateMockTransactions } from "@/data/transactions";
import { useTransactions } from "./use-transactions";

interface BanksState {
  banks: Bank[];
  addBank: (bank: Bank) => void;
  removeBank: (bankId: string) => void;
  refreshBank: (bankId: string) => void;
  clearAllBanks: () => void;
}

export const useBanksStore = create<BanksState>()(
  persist(
    (set, get) => ({
      banks: [],
      addBank: (bank) => {
        const { banks } = get();
        const existingBank = banks.find((b) => b.id === bank.id);
        
        if (!existingBank) {
          set({ banks: [...banks, bank] });
          
          // Generate mock transactions for this bank
          const { addTransactions } = useTransactions.getState();
          const mockTransactions = generateMockTransactions(bank.id);
          addTransactions(mockTransactions);
        }
      },
      removeBank: (bankId) => {
        const { banks } = get();
        set({ banks: banks.filter((bank) => bank.id !== bankId) });
        
        // Remove transactions for this bank
        const { removeTransactionsByBank } = useTransactions.getState();
        removeTransactionsByBank(bankId);
      },
      refreshBank: (bankId) => {
        const { banks } = get();
        const bank = banks.find((b) => b.id === bankId);
        
        if (bank) {
          // Update last updated timestamp
          const updatedBanks = banks.map((b) => 
            b.id === bankId 
              ? { ...b, lastUpdated: new Date().toLocaleDateString() }
              : b
          );
          
          set({ banks: updatedBanks });
          
          // Generate some new mock transactions
          const { addTransactions } = useTransactions.getState();
          const newTransactions = generateMockTransactions(bankId, 5);
          addTransactions(newTransactions);
        }
      },
      clearAllBanks: () => {
        set({ banks: [] });
        
        // Clear all transactions
        const { clearAllTransactions } = useTransactions.getState();
        clearAllTransactions();
      },
    }),
    {
      name: "banklink-banks",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useBanks() {
  const { banks, addBank, removeBank, refreshBank, clearAllBanks } = useBanksStore();
  
  return {
    banks,
    addBank,
    removeBank,
    refreshBank,
    clearAllBanks,
  };
}