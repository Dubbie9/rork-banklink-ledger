import { View, Text, StyleSheet } from "react-native";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { useTheme } from "@/context/theme-context";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react-native";

interface TransactionListProps {
  transactions: Transaction[];
  showHeader?: boolean;
}

export default function TransactionList({ transactions, showHeader = true }: TransactionListProps) {
  const { colors } = useTheme();

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No transactions found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Date</Text>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Description</Text>
          <Text style={[styles.headerText, { color: colors.textSecondary, textAlign: "right" }]}>Amount</Text>
        </View>
      )}

      {transactions.map((transaction) => (
        <View 
          key={transaction.id} 
          style={[styles.transaction, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(transaction.date)}
          </Text>
          
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.text }]}>
              {transaction.description}
            </Text>
            <Text style={[styles.reference, { color: colors.textSecondary }]}>
              {transaction.reference || "No reference"}
            </Text>
          </View>
          
          <View style={styles.amountContainer}>
            {transaction.type === "outgoing" ? (
              <ArrowUpRight size={14} color={colors.error} style={styles.icon} />
            ) : (
              <ArrowDownLeft size={14} color={colors.success} style={styles.icon} />
            )}
            <Text style={[
              styles.amount, 
              { color: transaction.type === "outgoing" ? colors.error : colors.success }
            ]}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  transaction: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  date: {
    width: "25%",
    fontSize: 12,
  },
  descriptionContainer: {
    flex: 1,
    paddingRight: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  reference: {
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "30%",
  },
  icon: {
    marginRight: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});