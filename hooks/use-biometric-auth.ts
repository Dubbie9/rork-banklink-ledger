import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "@banklink:biometric_enabled";

export function useBiometricAuth() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricPreference();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      if (Platform.OS === "web") {
        setIsSupported(false);
        return;
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setIsSupported(compatible && enrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face ID");
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Fingerprint");
      } else {
        setBiometricType("Biometric");
      }
    } catch (error) {
      console.error("Error checking biometric support:", error);
      setIsSupported(false);
    }
  };

  const loadBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(enabled === "true");
    } catch (error) {
      console.error("Error loading biometric preference:", error);
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async () => {
    try {
      if (Platform.OS === "web") {
        throw new Error("Biometric authentication not available on web");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} authentication`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use PIN",
      });

      if (result.success) {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
        setIsEnabled(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error enabling biometric:", error);
      return false;
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "false");
      setIsEnabled(false);
    } catch (error) {
      console.error("Error disabling biometric:", error);
    }
  };

  const authenticateWithBiometric = async (promptMessage: string = "Authenticate to continue") => {
    try {
      if (Platform.OS === "web") {
        throw new Error("Biometric authentication not available on web");
      }

      if (!isEnabled || !isSupported) {
        return { success: false, error: "Biometric authentication not available" };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: "Cancel",
        fallbackLabel: "Use PIN",
      });

      return result;
    } catch (error) {
      console.error("Error authenticating with biometric:", error);
      return { success: false, error: "Authentication failed" };
    }
  };

  return {
    isSupported,
    isEnabled,
    biometricType,
    loading,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  };
}