import { useState, useEffect } from "react";
import { useGoCardless } from "./use-gocardless";
import { useUserProfile } from "./use-user-profile";
import { trpcClient } from "@/lib/trpc";
import { Bank } from "@/types";

export function useRealBanks(countryCode?: string) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getValidAccessToken } = useGoCardless();
  const { profile } = useUserProfile();
  
  const fetchBanks = async (countryCode?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching banks - getting access token...");
      const accessToken = await getValidAccessToken();
      console.log("Access token obtained, fetching institutions...");
      
      // Use provided country code, user's country from profile, or fallback to GB
      const country = countryCode || profile?.country?.code || "gb";
      console.log(`Fetching institutions for country: ${country}`);
      
      const institutions = await trpcClient.gocardless.institutions.byCountry.query({
        accessToken,
        country,
      });
      
      console.log(`Fetched ${institutions.length} institutions for ${country}`);
      
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
    // Only fetch banks if we have a profile or use default
    fetchBanks(countryCode);
  }, [profile?.country?.code, countryCode]);
  
  return {
    banks,
    loading,
    error,
    refetch: () => fetchBanks(countryCode),
    fetchBanksForCountry: fetchBanks,
  };
}