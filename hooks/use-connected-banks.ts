import { useState, useEffect } from "react";
import { trpcClient } from "@/lib/trpc";
import { useFirebaseAuth } from "./use-firebase-auth";

export interface ConnectedBank {
  id: string;
  name: string;
  color: string;
  logoUrl: string;
  accountNumber: string;
  lastUpdated: string;
  transactionCount: number;
  requisitionId: string;
  accountId: string;
  connectedAt: string;
}

export function useConnectedBanks() {
  const [banks, setBanks] = useState<ConnectedBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useFirebaseAuth();

  const fetchConnectedBanks = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const connectedBanks = await trpcClient.banks.connected.list.query({
        userId: user.uid,
      });
      setBanks(connectedBanks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch connected banks";
      setError(errorMessage);
      console.error("Error fetching connected banks:", err);
    } finally {
      setLoading(false);
    }
  };

  const addConnectedBank = async (bankData: {
    bankId: string;
    bankName: string;
    requisitionId: string;
    accountId: string;
    accountNumber: string;
    color: string;
    logoUrl?: string;
  }) => {
    if (!user) throw new Error("User must be authenticated");
    
    try {
      const newBank = await trpcClient.banks.connected.add.mutate({
        userId: user.uid,
        ...bankData,
      });
      
      setBanks(prev => [...prev, newBank]);
      return newBank;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add connected bank";
      throw new Error(errorMessage);
    }
  };

  const removeConnectedBank = async (requisitionId: string) => {
    if (!user) throw new Error("User must be authenticated");
    
    try {
      await trpcClient.banks.connected.remove.mutate({
        userId: user.uid,
        requisitionId,
      });
      
      setBanks(prev => prev.filter(bank => bank.requisitionId !== requisitionId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove connected bank";
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchConnectedBanks();
  }, [user]);

  return {
    banks,
    loading,
    error,
    refetch: fetchConnectedBanks,
    addConnectedBank,
    removeConnectedBank,
  };
}