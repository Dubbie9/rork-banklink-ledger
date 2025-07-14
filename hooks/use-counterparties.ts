import { useMemo } from "react";
import { useTransactions } from "./use-transactions";
import { Counterparty } from "@/types";

export function useCounterparties() {
  const { transactions } = useTransactions();
  
  const counterparties = useMemo(() => {
    const counterpartiesMap = new Map<string, Counterparty>();
    
    transactions.forEach((transaction) => {
      const { counterpartyId, counterpartyName, amount, type } = transaction;
      
      if (!counterpartiesMap.has(counterpartyId)) {
        counterpartiesMap.set(counterpartyId, {
          id: counterpartyId,
          name: counterpartyName,
          totalSent: 0,
          totalReceived: 0,
          netPosition: 0,
        });
      }
      
      const counterparty = counterpartiesMap.get(counterpartyId)!;
      
      if (type === "outgoing") {
        counterparty.totalSent += amount;
        counterparty.netPosition -= amount;
      } else {
        counterparty.totalReceived += amount;
        counterparty.netPosition += amount;
      }
    });
    
    return Array.from(counterpartiesMap.values());
  }, [transactions]);
  
  const getCounterpartyById = (id: string) => {
    return counterparties.find((counterparty) => counterparty.id === id);
  };
  
  return {
    counterparties,
    getCounterpartyById,
  };
}