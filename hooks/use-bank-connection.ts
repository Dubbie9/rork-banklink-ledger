import { useState } from "react";
import { useGoCardless } from "./use-gocardless";
import { trpcClient } from "@/lib/trpc";
import { Linking } from "react-native";
import { useFirebaseAuth } from "./use-firebase-auth";

interface BankConnectionState {
  loading: boolean;
  error: string | null;
  requisitionId: string | null;
}

export function useBankConnection() {
  const [state, setState] = useState<BankConnectionState>({
    loading: false,
    error: null,
    requisitionId: null,
  });
  
  const { getValidAccessToken } = useGoCardless();
  const { user } = useFirebaseAuth();
  
  const connectBank = async (institutionId: string, bankName: string) => {
    if (!user) {
      throw new Error("User must be authenticated to connect a bank");
    }
    
    setState({ loading: true, error: null, requisitionId: null });
    
    try {
      const accessToken = await getValidAccessToken();
      
      // Create requisition
      const requisition = await trpcClient.gocardless.requisitions.create.mutate({
        accessToken,
        institutionId,
        redirectUrl: "banklink://bank-connected", // Deep link back to app
        reference: `${user.uid}-${Date.now()}`, // Unique reference
        userLanguage: "EN",
      });
      
      setState({ 
        loading: false, 
        error: null, 
        requisitionId: requisition.id 
      });
      
      // Open the bank's authentication page
      const canOpen = await Linking.canOpenURL(requisition.link);
      if (canOpen) {
        await Linking.openURL(requisition.link);
      } else {
        throw new Error("Cannot open bank authentication page");
      }
      
      return requisition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect bank";
      setState({ loading: false, error: errorMessage, requisitionId: null });
      throw new Error(errorMessage);
    }
  };
  
  const checkConnectionStatus = async (requisitionId: string) => {
    try {
      const accessToken = await getValidAccessToken();
      const requisition = await trpcClient.gocardless.requisitions.get.query({
        accessToken,
        requisitionId,
      });
      
      return requisition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check connection status";
      throw new Error(errorMessage);
    }
  };
  
  const disconnectBank = async (requisitionId: string) => {
    try {
      const accessToken = await getValidAccessToken();
      await trpcClient.gocardless.requisitions.delete.mutate({
        accessToken,
        requisitionId,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect bank";
      throw new Error(errorMessage);
    }
  };
  
  return {
    ...state,
    connectBank,
    checkConnectionStatus,
    disconnectBank,
  };
}