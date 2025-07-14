import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { Lock, ShieldCheck, BarChart3, User } from "lucide-react-native";

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleGetStarted = () => {
    router.push("/(auth)/create-pin");
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundAccent]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1611174340587-7cf0596f28d6?q=80&w=200&auto=format&fit=crop" }}
              style={styles.logoImage}
            />
            <Text style={[styles.appName, { color: colors.text }]}>
              BankLink <Text style={{ color: colors.primary }}>Ledger</Text>
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <ShieldCheck size={24} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Secure Connection</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Connect securely to your UK banks via Open Banking
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <BarChart3 size={24} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Track Transfers</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  See who you've sent money to and received from
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Lock size={24} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Privacy First</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Your data stays on your device, encrypted and secure
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.getStartedButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedText}>Continue as Guest</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { 
                  borderColor: colors.primary, 
                  opacity: pressed ? 0.9 : 1 
                }
              ]}
              onPress={handleLogin}
            >
              <User size={18} color={colors.primary} style={styles.loginIcon} />
              <Text style={[styles.loginText, { color: colors.primary }]}>
                Log in or Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 16,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  getStartedButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
  loginIcon: {
    marginRight: 8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "600",
  },
});