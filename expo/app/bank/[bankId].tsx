import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useBanks } from "@/hooks/use-banks";
import { useTransactions } from "@/hooks/use-transactions";
import { useCounterparties } from "@/hooks/use-counterparties";
import { formatCurrency } from "@/utils/format";
import { Search, ArrowUpRight, ArrowDownLeft, User } from "lucide-react-native";
import TransactionList from "@/components/TransactionList";
import BankLogo from "@/components/BankLogo";

export default function BankDetailScreen() {
  const { bankId } = useLocalSearchParams();
  const { colors } = useTheme();
  const { banks } = useBanks();
  const { transactions } = useTransactions();
  const { counterparties } = useCounterparties();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const bank = banks.find(b => b.id === bankId);
  const bankTransactions = transactions.filter(tx => tx.bankId === bankId);
  
  // Filter transactions by search query (counterparty name)
  const filteredTransactions = bankTransactions.filter(tx => 
    tx.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique counterparties for this bank
  const bankCounterparties = counterparties.filter(cp => 
    bankTransactions.some(tx => tx.counterpartyId === cp.id) &&
    cp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!bank) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Bank not found</Text>
      </SafeAreaView>
    );
  }

  const totalSent = bankTransactions
    .filter(tx => tx.type === "outgoing")
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalReceived = bankTransactions
    .filter(tx => tx.type === "incoming")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleCounterpartyPress = (counterpartyId: string) => {
    router.push(`/person/${counterpartyId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>

      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BankLogo 
            logoUrl={bank.logoUrl} 
            bankName={bank.name} 
            size={80} 
            fallbackColor={bank.color} 
          />
          <Text style={[styles.bankName, { color: colors.text }]}>{bank.name}</Text>
          <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
            Account: {bank.accountNumber}
          </Text>
        </View>

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
            <View style={styles.summaryCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                <ArrowUpRight size={20} color={colors.error} />
              </View>
              <Text style={[styles.summaryCardTitle, { color: colors.textSecondary }]}>
                Total Sent
              </Text>
            </View>
            <Text style={[styles.summaryCardAmount, { color: colors.text }]}>
              {formatCurrency(totalSent)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
            <View style={styles.summaryCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
                <ArrowDownLeft size={20} color={colors.success} />
              </View>
              <Text style={[styles.summaryCardTitle, { color: colors.textSecondary }]}>
                Total Received
              </Text>
            </View>
            <Text style={[styles.summaryCardAmount, { color: colors.text }]}>
              {formatCurrency(totalReceived)}
            </Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by recipient name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {searchQuery && bankCounterparties.length > 0 && (
          <View style={styles.counterpartiesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              People ({bankCounterparties.length})
            </Text>
            {bankCounterparties.map((counterparty) => (
              <Pressable
                key={counterparty.id}
                style={({ pressed }) => [
                  styles.counterpartyCard,
                  { 
                    backgroundColor: colors.backgroundAccent,
                    borderColor: colors.border,
                    opacity: pressed ? 0.9 : 1
                  }
                ]}
                onPress={() => handleCounterpartyPress(counterparty.id)}
              >
                <View style={styles.counterpartyInfo}>
                  <View style={[styles.counterpartyInitials, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.initialsText, { color: colors.primary }]}>
                      {counterparty.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.counterpartyDetails}>
                    <Text style={[styles.counterpartyName, { color: colors.text }]}>
                      {counterparty.name}
                    </Text>
                    <View style={styles.counterpartyStats}>
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        Sent: {formatCurrency(counterparty.totalSent)} • 
                        Received: {formatCurrency(counterparty.totalReceived)}
                      </Text>
                    </View>
                  </View>
                </View>
                <User size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery ? `Transactions with "${searchQuery}" (${filteredTransactions.length})` : `All Transactions (${bankTransactions.length})`}
          </Text>
          
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchQuery ? `No transactions found with "${searchQuery}"` : "No transactions found"}
              </Text>
            </View>
          ) : (
            <TransactionList 
              transactions={filteredTransactions} 
              showHeader={true}
            />
          )}
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    paddingTop: 20, // Safe area now handles the top padding
  },
  bankName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: "100%",
  },
  counterpartiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  counterpartyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  counterpartyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  counterpartyInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: "600",
  },
  counterpartyDetails: {
    flex: 1,
  },
  counterpartyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  counterpartyStats: {
    flexDirection: "row",
  },
  statText: {
    fontSize: 12,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});