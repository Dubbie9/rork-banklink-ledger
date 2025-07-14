import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpcClient } from "@/lib/trpc";

interface GoCardlessTokens {
  access: string;
  refresh: string;
  access_expires: number;
  refresh_expires: number;
}

interface GoCardlessState {
  tokens: GoCardlessTokens | null;
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearTokens: () => void;
}

export const useGoCardlessStore = create<GoCardlessState>()(
  persist(
    (set, get) => ({
      tokens: null,
      isAuthenticated: false,
      
      authenticate: async () => {
        try {
          console.log("Authenticating with GoCardless...");
          const response = await trpcClient.gocardless.auth.getAccessToken.mutate();
          console.log("GoCardless authentication successful");
          
          const tokens: GoCardlessTokens = {
            access: response.access,
            refresh: response.refresh,
            access_expires: response.access_expires,
            refresh_expires: response.refresh_expires,
          };
          
          set({ tokens, isAuthenticated: true });
        } catch (error) {
          console.error("Failed to authenticate with GoCardless:", error);
          set({ tokens: null, isAuthenticated: false });
          throw error;
        }
      },
      
      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refresh) {
          console.error("No refresh token available");
          throw new Error("No refresh token available");
        }
        
        try {
          console.log("Refreshing GoCardless tokens...");
          const response = await trpcClient.gocardless.auth.refreshToken.mutate({
            refreshToken: tokens.refresh,
          });
          console.log("GoCardless token refresh successful");
          
          const newTokens: GoCardlessTokens = {
            access: response.access,
            refresh: response.refresh,
            access_expires: response.access_expires,
            refresh_expires: response.refresh_expires,
          };
          
          set({ tokens: newTokens, isAuthenticated: true });
        } catch (error) {
          console.error("Failed to refresh GoCardless tokens:", error);
          set({ tokens: null, isAuthenticated: false });
          throw error;
        }
      },
      
      clearTokens: () => {
        set({ tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: "gocardless-tokens",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useGoCardless() {
  const { tokens, isAuthenticated, authenticate, refreshTokens, clearTokens } = useGoCardlessStore();
  
  const getValidAccessToken = async (): Promise<string> => {
    if (!tokens) {
      console.log("No tokens found, authenticating...");
      await authenticate();
      const newTokens = useGoCardlessStore.getState().tokens;
      if (!newTokens) throw new Error("Failed to get access token");
      return newTokens.access;
    }
    
    // Validate token structure
    if (!tokens.access || !tokens.refresh || !tokens.access_expires || !tokens.refresh_expires) {
      console.log("Invalid token structure, clearing and re-authenticating...");
      clearTokens();
      await authenticate();
      const newTokens = useGoCardlessStore.getState().tokens;
      if (!newTokens) throw new Error("Failed to get access token after clearing invalid tokens");
      return newTokens.access;
    }
    
    // Check if access token is expired (with 5 minute buffer)
    const now = Date.now() / 1000;
    const expiresAt = tokens.access_expires;
    
    console.log(`Token check: now=${now}, expires=${expiresAt}, buffer=${expiresAt - 300}`);
    
    if (now >= (expiresAt - 300)) { // 5 minutes before expiry
      console.log("Token expired, refreshing...");
      try {
        await refreshTokens();
        const refreshedTokens = useGoCardlessStore.getState().tokens;
        if (!refreshedTokens) throw new Error("Failed to refresh access token");
        return refreshedTokens.access;
      } catch (error) {
        console.log("Token refresh failed, re-authenticating...");
        // If refresh fails, try to get new tokens
        clearTokens();
        await authenticate();
        const newTokens = useGoCardlessStore.getState().tokens;
        if (!newTokens) throw new Error("Failed to get access token after re-authentication");
        return newTokens.access;
      }
    }
    
    return tokens.access;
  };
  
  const forceReauthenticate = async (): Promise<void> => {
    console.log("Forcing re-authentication...");
    clearTokens();
    await authenticate();
  };
  
  return {
    tokens,
    isAuthenticated,
    authenticate,
    refreshTokens,
    clearTokens,
    getValidAccessToken,
    forceReauthenticate,
  };
}