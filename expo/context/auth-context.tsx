import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useGoCardlessStore } from "@/hooks/use-gocardless";

type AuthContextType = {
  pin: string;
  authenticated: boolean;
  setPin: (pin: string) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    const loadPin = async () => {
      try {
        const storedPin = await AsyncStorage.getItem("@banklink:pin");
        if (storedPin) {
          setPin(storedPin);
        }
      } catch (error) {
        console.error("Failed to load PIN:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPin();
  }, []);

  // If user is logged in with Firebase, consider them authenticated
  useEffect(() => {
    if (user) {
      setAuthenticated(true);
    }
  }, [user]);

  const handleSetPin = async (newPin: string) => {
    try {
      await AsyncStorage.setItem("@banklink:pin", newPin);
      setPin(newPin);
      setAuthenticated(true);
    } catch (error) {
      console.error("Failed to save PIN:", error);
    }
  };

  const handleLogout = async () => {
    setAuthenticated(false);
    
    // Clear GoCardless tokens on logout
    const { clearTokens } = useGoCardlessStore.getState();
    clearTokens();
    
    // Also logout from Firebase if user is logged in
    if (user) {
      await firebaseLogout();
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        pin,
        authenticated,
        setPin: handleSetPin,
        setAuthenticated,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}