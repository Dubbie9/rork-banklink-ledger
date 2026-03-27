import { useState, useEffect } from "react";
import { useGoCardless } from "./use-gocardless";
import { trpcClient } from "@/lib/trpc";
import { Transaction } from "@/types";

interface ConnectedAccount {
  accountId: string;
  bankName: string;
  requisitionId: string;
}

export function useRealTransactions(connectedAccounts: ConnectedAccount[]) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getValidAccessToken } = useGoCardless();
  
  const fetchTransactions = async () => {
    if (connectedAccounts.length === 0) {
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await getValidAccessToken();
      const allTransactions: Transaction[] = [];
      
      // Fetch transactions for each connected account
      for (const account of connectedAccounts) {
        try {
          const accountTransactions = await trpcClient.gocardless.accounts.transactions.query({
            accessToken,
            accountId: account.accountId,
            // Get last 90 days by default
            dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
          });
          
          // Add bank name to each transaction
          const transactionsWithBank = accountTransactions.map((tx: Transaction) => ({
            ...tx,
            bankName: account.bankName,
          }));
          
          allTransactions.push(...transactionsWithBank);
        } catch (accountError) {
          console.error(`Failed to fetch transactions for account ${account.accountId}:`, accountError);
          // Continue with other accounts even if one fails
        }
      }
      
      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(errorMessage);
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshTransactions = () => {
    fetchTransactions();
  };
  
  useEffect(() => {
    fetchTransactions();
  }, [connectedAccounts]);
  
  return {
    transactions,
    loading,
    error,
    refresh: refreshTransactions,
  };
}