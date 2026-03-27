import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { ArrowLeft, Mail } from "lucide-react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword } = useFirebaseAuth();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please check your email and try again";
      Alert.alert("Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Pressable 
        style={styles.backButton} 
        onPress={handleBack}
      >
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email to receive a password reset link
          </Text>
        </View>
        
        {resetSent ? (
          <View style={styles.successContainer}>
            <Text style={[styles.successTitle, { color: colors.success }]}>
              Reset Link Sent!
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              We've sent a password reset link to {email}. Please check your email and follow the instructions.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.backToLoginButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  resetButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  successContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  backToLoginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});