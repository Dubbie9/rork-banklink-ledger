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
          const response = await trpcClient.gocardless.auth.getAccessToken.mutate();
          
          const tokens: GoCardlessTokens = {
            access: response.access,
            refresh: response.refresh,
            access_expires: response.access_expires,
            refresh_expires: response.refresh_expires,
          };
          
          set({ tokens, isAuthenticated: true });
        } catch (error) {
          console.error("Failed to authenticate with GoCardless:", error);
          throw error;
        }
      },
      
      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refresh) {
          throw new Error("No refresh token available");
        }
        
        try {
          const response = await trpcClient.gocardless.auth.refreshToken.mutate({
            refreshToken: tokens.refresh,
          });
          
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
      await authenticate();
      const newTokens = useGoCardlessStore.getState().tokens;
      if (!newTokens) throw new Error("Failed to get access token");
      return newTokens.access;
    }
    
    // Check if access token is expired (with 5 minute buffer)
    const now = Date.now() / 1000;
    const expiresAt = tokens.access_expires;
    
    if (now >= (expiresAt - 300)) { // 5 minutes before expiry
      await refreshTokens();
      const refreshedTokens = useGoCardlessStore.getState().tokens;
      if (!refreshedTokens) throw new Error("Failed to refresh access token");
      return refreshedTokens.access;
    }
    
    return tokens.access;
  };
  
  return {
    tokens,
    isAuthenticated,
    authenticate,
    refreshTokens,
    clearTokens,
    getValidAccessToken,
  };
}