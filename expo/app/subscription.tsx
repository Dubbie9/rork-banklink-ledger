import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useSubscription } from "@/hooks/use-subscription";
import { CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const { subscription, cancelSubscription, isSubscriptionLoading } = useSubscription();
  const router = useRouter();
  
  const [isCancelling, setIsCancelling] = useState(false);
  
  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You'll continue to have access to Pro features until the end of your current billing period.",
      [
        { text: "No, Keep It", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            
            setIsCancelling(true);
            try {
              await cancelSubscription();
              
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert(
                "Subscription Cancelled",
                "Your subscription has been cancelled. You'll continue to have access to Pro features until the end of your current billing period.",
                [{ text: "OK", onPress: () => router.push("/(app)/profile") }]
              );
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription. Please try again.";
              Alert.alert("Error", errorMessage);
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };
  
  if (isSubscriptionLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{ 
            title: "Subscription",
            headerTintColor: colors.text,
            headerStyle: { backgroundColor: colors.background },
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading subscription details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!subscription?.isPro) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{ 
            title: "Subscription",
            headerTintColor: colors.text,
            headerStyle: { backgroundColor: colors.background },
          }} 
        />
        <View style={styles.noSubscriptionContainer}>
          <AlertCircle size={48} color={colors.textSecondary} style={styles.noSubscriptionIcon} />
          <Text style={[styles.noSubscriptionTitle, { color: colors.text }]}>
            No Active Subscription
          </Text>
          <Text style={[styles.noSubscriptionDescription, { color: colors.textSecondary }]}>
            You don't have an active Pro subscription
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.upgradeButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={() => router.push("/upgrade")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: "Subscription",
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
        }} 
      />
      
      <View style={styles.content}>
        <View style={[styles.subscriptionCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
          <View style={styles.subscriptionHeader}>
            <CheckCircle size={24} color={colors.success} style={styles.activeIcon} />
            <Text style={[styles.activeText, { color: colors.success }]}>Active</Text>
          </View>
          
          <Text style={[styles.planTitle, { color: colors.text }]}>
            BankLink Ledger Pro
          </Text>
          <Text style={[styles.planType, { color: colors.textSecondary }]}>
            {subscription.plan === "monthly" ? "Monthly Plan" : "Annual Plan"}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <CreditCard size={20} color={colors.primary} style={styles.detailIcon} />
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Price
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {subscription.plan === "monthly" ? "£3.99 per month" : "£39 per year"}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Calendar size={20} color={colors.primary} style={styles.detailIcon} />
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Next Billing Date
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {subscription.nextBillingDate}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.managementButton,
              { 
                backgroundColor: colors.backgroundAccent, 
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1
              }
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.managementButtonText, { color: colors.text }]}>
              Update Payment Method
            </Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { 
                backgroundColor: colors.errorLight,
                opacity: pressed || isCancelling ? 0.7 : 1
              }
            ]}
            onPress={handleCancelSubscription}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                Cancel Subscription
              </Text>
            )}
          </Pressable>
        </View>
        
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          If you cancel, you'll continue to have access to Pro features until the end of your current billing period.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subscriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activeIcon: {
    marginRight: 8,
  },
  activeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  planType: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  managementButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  managementButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noSubscriptionIcon: {
    marginBottom: 16,
  },
  noSubscriptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  noSubscriptionDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});