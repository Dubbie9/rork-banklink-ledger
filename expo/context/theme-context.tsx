import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "@/constants/colors";
import * as SystemUI from "expo-system-ui";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors | typeof darkColors;
  followSystem: boolean;
  setFollowSystem: (follow: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === "dark");
  const [followSystem, setFollowSystemState] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem("@banklink:theme");
        const followSystemPref = await AsyncStorage.getItem("@banklink:followSystem");
        
        const shouldFollowSystem = followSystemPref !== null ? followSystemPref === "true" : true;
        setFollowSystemState(shouldFollowSystem);
        
        if (shouldFollowSystem) {
          setIsDark(systemColorScheme === "dark");
        } else if (themePreference !== null) {
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

  // Update theme when system changes and followSystem is true
  useEffect(() => {
    if (followSystem) {
      setIsDark(systemColorScheme === "dark");
    }
  }, [systemColorScheme, followSystem]);

  // Update system UI style
  useEffect(() => {
    if (Platform.OS === "ios") {
      SystemUI.setBackgroundColorAsync(isDark ? darkColors.background : lightColors.background);
    }
  }, [isDark]);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      await AsyncStorage.setItem("@banklink:theme", newTheme ? "dark" : "light");
      await AsyncStorage.setItem("@banklink:followSystem", "false");
      setFollowSystemState(false);
      setIsDark(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const setFollowSystem = async (follow: boolean) => {
    try {
      await AsyncStorage.setItem("@banklink:followSystem", follow.toString());
      setFollowSystemState(follow);
      if (follow) {
        setIsDark(systemColorScheme === "dark");
      }
    } catch (error) {
      console.error("Failed to save follow system preference:", error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, followSystem, setFollowSystem }}>
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