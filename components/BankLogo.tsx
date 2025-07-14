import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/context/theme-context";
import { Building2 } from "lucide-react-native";

interface BankLogoProps {
  logoUrl: string;
  bankName: string;
  size?: number;
  fallbackColor?: string;
}

export default function BankLogo({ 
  logoUrl, 
  bankName, 
  size = 40, 
  fallbackColor 
}: BankLogoProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 5,
    backgroundColor: fallbackColor || colors.backgroundAccent,
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!hasError ? (
        <Image
          source={{ uri: logoUrl }}
          style={styles.logo}
          contentFit="contain"
          transition={200}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      ) : (
        <Building2 
          size={size * 0.6} 
          color={colors.primary} 
        />
      )}
      
      {isLoading && !hasError && (
        <ActivityIndicator 
          size="small" 
          color={colors.primary}
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: {
    width: "80%",
    height: "80%",
  },
  loader: {
    position: "absolute",
  },
});