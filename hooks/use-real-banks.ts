import { useState, useEffect } from "react";
import { useGoCardless } from "./use-gocardless";
import { trpcClient } from "@/lib/trpc";
import { Bank } from "@/types";

export function useRealBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getValidAccessToken } = useGoCardless();
  
  const fetchBanks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching banks - getting access token...");
      const accessToken = await getValidAccessToken();
      console.log("Access token obtained, fetching institutions...");
      
      const institutions = await trpcClient.gocardless.institutions.list.query({
        accessToken,
        country: "gb",
      });
      
      console.log(`Fetched ${institutions.length} institutions`);
      
      // Transform institutions to Bank format
      const transformedBanks: Bank[] = institutions.map((institution: any) => ({
        id: institution.id,
        name: institution.name,
        color: institution.color,
        logoUrl: institution.logoUrl || "",
      }));
      
      setBanks(transformedBanks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch banks";
      setError(errorMessage);
      console.error("Error fetching banks:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBanks();
  }, []);
  
  return {
    banks,
    loading,
    error,
    refetch: fetchBanks,
  };
}