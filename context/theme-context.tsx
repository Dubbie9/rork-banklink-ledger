import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "@/constants/colors";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors | typeof darkColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === "dark");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem("@banklink:theme");
        if (themePreference !== null) {
          setIsDark(themePreference === "dark");
        } else {
          setIsDark(systemColorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      await AsyncStorage.setItem("@banklink:theme", newTheme ? "dark" : "light");
      setIsDark(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}