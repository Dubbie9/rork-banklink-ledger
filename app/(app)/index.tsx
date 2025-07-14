import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useBanks } from "@/hooks/use-banks";
import { useTransactions } from "@/hooks/use-transactions";
import { useCounterparties } from "@/hooks/use-counterparties";
import { formatCurrency } from "@/utils/format";
import { ArrowUpRight, ArrowDownLeft, Plus, TrendingUp, Sparkles, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import TransactionList from "@/components/TransactionList";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { banks } = useBanks();
  const { transactions } = useTransactions();
  const { counterparties } = useCounterparties();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalSent = transactions.reduce(
    (sum, tx) => (tx.type === "outgoing" ? sum + tx.amount : sum),
    0
  );
  
  const totalReceived = transactions.reduce(
    (sum, tx) => (tx.type === "incoming" ? sum + tx.amount : sum),
    0
  );

  const netPosition = totalReceived - totalSent;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddBank = () => {
    router.push("/banks");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.greetingContainer}>
            <Sparkles size={24} color={colors.primary} style={styles.sparkleIcon} />
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting()}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your financial overview
          </Text>
        </Animated.View>

        {banks.length === 0 ? (
          <Animated.View 
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={[colors.primaryLight, colors.backgroundAccent]}
              style={[styles.noBanksCard, { borderColor: colors.border }]}
            >
              <View style={[styles.noBanksIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Plus size={32} color={colors.primary} />
              </View>
              <Text style={[styles.noBanksTitle, { color: colors.text }]}>
                Connect your first bank
              </Text>
              <Text style={[styles.noBanksDescription, { color: colors.textSecondary }]}>
                Add a bank account to start tracking your transfers and get insights into your spending
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addBankButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
                ]}
                onPress={handleAddBank}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addBankButtonText}>Add Bank</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        ) : (
          <>
            <Animated.View 
              style={[
                styles.summaryCards,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={[styles.summaryCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
                <View style={styles.summaryCardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                    <ArrowUpRight size={20} color={colors.error} />
                  </View>
                  <Text style={[styles.summaryCardTitle, { color: colors.textSecondary }]}>
                    Sent
                  </Text>
                </View>
                <Text style={[styles.summaryCardAmount, { color: colors.text }]}>
                  {formatCurrency(totalSent)}
                </Text>
                <View style={styles.cardAccent} />
              </View>

              <View style={[styles.summaryCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
                <View style={styles.summaryCardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
                    <ArrowDownLeft size={20} color={colors.success} />
                  </View>
                  <Text style={[styles.summaryCardTitle, { color: colors.textSecondary }]}>
                    Received
                  </Text>
                </View>
                <Text style={[styles.summaryCardAmount, { color: colors.text }]}>
                  {formatCurrency(totalReceived)}
                </Text>
                <View style={styles.cardAccent} />
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <LinearGradient
                colors={netPosition >= 0 ? [colors.successLight, colors.backgroundAccent] : [colors.errorLight, colors.backgroundAccent]}
                style={[styles.netPositionCard, { borderColor: colors.border }]}
              >
                <View style={styles.netPositionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                    <TrendingUp size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.netPositionTitle, { color: colors.textSecondary }]}>
                    Net Position
                  </Text>
                </View>
                <Text style={[
                  styles.netPositionAmount, 
                  { color: netPosition >= 0 ? colors.success : colors.error }
                ]}>
                  {formatCurrency(netPosition)}
                </Text>
                <Text style={[styles.netPositionDescription, { color: colors.textSecondary }]}>
                  {netPosition >= 0 
                    ? "You've received more than you've sent" 
                    : "You've sent more than you've received"}
                </Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View 
              style={[
                styles.recentTransactionsContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Clock size={20} color={colors.primary} style={styles.sectionIcon} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Recent Activity
                  </Text>
                </View>
                <Text style={[styles.transactionCount, { color: colors.textSecondary }]}>
                  {recentTransactions.length} transactions
                </Text>
              </View>
              
              <View style={[styles.transactionListContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
                <TransactionList 
                  transactions={recentTransactions} 
                  showHeader={false}
                />
              </View>
              
              {transactions.length > 5 && (
                <Pressable
                  onPress={() => router.push("/people")}
                  style={({ pressed }) => [
                    styles.viewAllButton,
                    { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }
                  ]}
                >
                  <Text style={[styles.viewAllButtonText, { color: colors.primary }]}>
                    View All Transactions
                  </Text>
                  <ArrowUpRight size={16} color={colors.primary} />
                </Pressable>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sparkleIcon: {
    marginRight: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    marginLeft: 32, // Align with greeting text after icon
  },
  noBanksCard: {
    margin: 20,
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  noBanksIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noBanksTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  noBanksDescription: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  addBankButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  addBankButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryCardAmount: {
    fontSize: 22,
    fontWeight: "700",
  },
  cardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(79, 70, 229, 0.3)",
  },
  netPositionCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  netPositionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  netPositionTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  netPositionAmount: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  netPositionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  recentTransactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  transactionCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionListContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  viewAllButtonText: {
    fontWeight: "600",
    marginRight: 4,
    fontSize: 16,
  },
});