import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useRealBanks } from "@/hooks/use-real-banks";
import { useBankConnection } from "@/hooks/use-bank-connection";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import BankLogo from "@/components/BankLogo";

export default function BankConnectScreen() {
  const { bankId } = useLocalSearchParams();
  const { colors } = useTheme();
  const { banks } = useRealBanks();
  const { connectBank, loading, error } = useBankConnection();
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "connecting" | "success" | "error">("auth");
  
  const bank = banks.find(b => b.id === bankId);
  
  useEffect(() => {
    if (error) {
      setStep("error");
    }
  }, [error]);
  
  if (!bank) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Bank not found</Text>
      </SafeAreaView>
    );
  }

  const handleConnect = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to connect a bank account.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/(auth)/login") }
        ]
      );
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setStep("connecting");
    
    try {
      await connectBank(bank.id, bank.name);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setStep("success");
      
      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      console.error("Bank connection error:", err);
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("auth");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === "auth" && (
        <View style={styles.content}>
          <BankLogo 
            logoUrl={bank.logoUrl} 
            bankName={bank.name} 
            size={80} 
            fallbackColor={bank.color} 
          />
          
          <Text style={[styles.title, { color: colors.text }]}>
            Connect to {bank.name}
          </Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            You'll be securely connected to {bank.name} via Open Banking. 
            BankLink Ledger only has read-only access and cannot make payments.
          </Text>
          
          <View style={[styles.permissionsContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
            <Text style={[styles.permissionsTitle, { color: colors.text }]}>
              Permissions Requested
            </Text>
            
            <View style={styles.permissionItem}>
              <Lock size={18} color={colors.primary} style={styles.permissionIcon} />
              <View>
                <Text style={[styles.permissionName, { color: colors.text }]}>
                  Account Information
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                  Account holder, account number, sort code
                </Text>
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <Lock size={18} color={colors.primary} style={styles.permissionIcon} />
              <View>
                <Text style={[styles.permissionName, { color: colors.text }]}>
                  Transaction History
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                  Past 90 days of transactions (read-only)
                </Text>
              </View>
            </View>
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.connectButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.connectButtonText}>Connect to {bank.name}</Text>
            )}
          </Pressable>
          
          <Text style={[styles.securityNote, { color: colors.textSecondary }]}>
            Your credentials are never stored. We use secure Open Banking APIs.
          </Text>
        </View>
      )}
      
      {step === "connecting" && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Connecting to {bank.name}...
          </Text>
          <Text style={[styles.loadingDescription, { color: colors.textSecondary }]}>
            Please complete the authentication in your browser or banking app
          </Text>
        </View>
      )}
      
      {step === "success" && (
        <View style={styles.successContainer}>
          <CheckCircle2 size={60} color={colors.success} />
          <Text style={[styles.successText, { color: colors.text }]}>
            Successfully Connected
          </Text>
          <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
            Your {bank.name} account has been connected and transactions are being imported
          </Text>
        </View>
      )}

      {step === "error" && (
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Connection Failed
          </Text>
          <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
            {error || "Failed to connect to your bank. Please try again."}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionsContainer: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 32,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  permissionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
  },
  connectButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  securityNote: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 16,
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  retryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});