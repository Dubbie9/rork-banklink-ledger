import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Check, Crown, CreditCard, ArrowRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function UpgradeScreen() {
  const { colors } = useTheme();
  const { user } = useFirebaseAuth();
  const { subscribe, isSubscriptionLoading } = useSubscription();
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSelectPlan = (plan: "monthly" | "annual") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
  };
  
  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to subscribe to BankLink Ledger Pro",
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
    
    setIsProcessing(true);
    try {
      // In a real app, this would integrate with Stripe or RevenueCat
      // For this demo, we'll simulate a successful subscription
      await subscribe(selectedPlan);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        "Subscription Successful",
        "Thank you for subscribing to BankLink Ledger Pro!",
        [{ text: "OK", onPress: () => router.push("/(app)/profile") }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again later";
      Alert.alert("Subscription Failed", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const features = [
    "Unlimited bank connections",
    "Export transaction history",
    "Advanced analytics and insights",
    "Automatic categorization",
    "Email notifications for large transfers",
    "Priority customer support"
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Stack.Screen 
        options={{ 
          title: "Upgrade to Pro",
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.crownContainer, { backgroundColor: colors.primaryLight }]}>
            <Crown size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>BankLink Ledger Pro</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock premium features and take control of your finances
          </Text>
        </View>
        
        <View style={styles.planSelector}>
          <Pressable
            style={[
              styles.planOption,
              { 
                backgroundColor: selectedPlan === "monthly" ? colors.primaryLight : colors.backgroundAccent,
                borderColor: selectedPlan === "monthly" ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleSelectPlan("monthly")}
          >
            <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>£3.99</Text>
            <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>per month</Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.planOption,
              { 
                backgroundColor: selectedPlan === "annual" ? colors.primaryLight : colors.backgroundAccent,
                borderColor: selectedPlan === "annual" ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleSelectPlan("annual")}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
            <Text style={[styles.planName, { color: colors.text }]}>Annual</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>£39</Text>
            <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>per year</Text>
            <Text style={[styles.planSaving, { color: colors.success }]}>Save 18%</Text>
          </Pressable>
        </View>
        
        <View style={[styles.featuresContainer, { borderColor: colors.border }]}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            Pro Features
          </Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.checkContainer, { backgroundColor: colors.primaryLight }]}>
                <Check size={14} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            { backgroundColor: colors.primary, opacity: pressed || isProcessing ? 0.9 : 1 }
          ]}
          onPress={handleSubscribe}
          disabled={isProcessing || isSubscriptionLoading}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CreditCard size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.subscribeButtonText}>
                Subscribe {selectedPlan === "monthly" ? "£3.99/month" : "£39/year"}
              </Text>
            </>
          )}
        </Pressable>
        
        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at any time.
        </Text>
        
        <Pressable
          style={styles.restoreContainer}
          onPress={() => {}}
        >
          <Text style={[styles.restoreText, { color: colors.primary }]}>
            Restore Purchases
          </Text>
          <ArrowRight size={16} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  crownContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  planSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  planOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FFB800",
    borderRadius: 12,
  },
  bestValueText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  planPeriod: {
    fontSize: 14,
  },
  planSaving: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  featuresContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderTopWidth: 1,
    paddingTop: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
  },
  subscribeButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 24,
    lineHeight: 18,
  },
  restoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
});