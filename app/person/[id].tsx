import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useCounterparties } from "@/hooks/use-counterparties";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/utils/format";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import TransactionList from "@/components/TransactionList";

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { getCounterpartyById } = useCounterparties();
  const { getTransactionsByCounterparty } = useTransactions();
  
  const person = getCounterpartyById(id as string);
  const transactions = getTransactionsByCounterparty(id as string);
  
  if (!person) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Person not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>

      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.personInitials, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.initialsText, { color: colors.primary }]}>
              {person.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.personName, { color: colors.text }]}>{person.name}</Text>
        </View>
        
        <View style={styles.summaryCards}>
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
              {formatCurrency(person.totalSent)}
            </Text>
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
              {formatCurrency(person.totalReceived)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.netPositionCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
          <Text style={[styles.netPositionTitle, { color: colors.textSecondary }]}>
            Net Position
          </Text>
          <Text style={[
            styles.netPositionAmount, 
            { color: person.netPosition >= 0 ? colors.success : colors.error }
          ]}>
            {formatCurrency(person.netPosition)}
          </Text>
          <Text style={[styles.netPositionDescription, { color: colors.textSecondary }]}>
            {person.netPosition > 0 
              ? `${person.name} owes you ${formatCurrency(person.netPosition)}`
              : person.netPosition < 0
                ? `You owe ${person.name} ${formatCurrency(Math.abs(person.netPosition))}`
                : "You're all square"}
          </Text>
        </View>
        
        <View style={styles.transactionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaction History
          </Text>
          <TransactionList 
            transactions={transactions} 
            showHeader={true}
          />
        </View>
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
    paddingVertical: 24,
  },
  personInitials: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: "600",
  },
  personName: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
  },
  summaryCardAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  netPositionCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  netPositionTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  netPositionAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  netPositionDescription: {
    fontSize: 14,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});