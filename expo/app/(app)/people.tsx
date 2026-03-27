import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useCounterparties } from "@/hooks/use-counterparties";
import { formatCurrency } from "@/utils/format";
import { Search, ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function PeopleScreen() {
  const { colors } = useTheme();
  const { counterparties } = useCounterparties();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCounterparties = counterparties.filter(
    (person) => person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Counterparty }) => (
    <Pressable
      style={({ pressed }) => [
        styles.personCard,
        { 
          backgroundColor: colors.backgroundAccent,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1
        }
      ]}
      onPress={() => router.push(`/person/${item.id}`)}
    >
      <View style={styles.personInfo}>
        <View style={[styles.personInitials, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.initialsText, { color: colors.primary }]}>
            {item.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.personName, { color: colors.text }]}>{item.name}</Text>
      </View>
      
      <View style={styles.personStats}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <ArrowUpRight size={14} color={colors.error} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sent</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(item.totalSent)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <ArrowDownLeft size={14} color={colors.success} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Received</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(item.totalReceived)}
          </Text>
        </View>
        
        <View style={styles.netPosition}>
          <Text style={[styles.netLabel, { color: colors.textSecondary }]}>Net</Text>
          <Text style={[
            styles.netValue, 
            { color: item.netPosition >= 0 ? colors.success : colors.error }
          ]}>
            {formatCurrency(item.netPosition)}
          </Text>
        </View>
        
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>People</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your transfer history with each person
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search people..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {counterparties.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No transfer history yet
          </Text>
          <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
            Connect a bank to see your transfer history with people
          </Text>
        </View>
      ) : filteredCounterparties.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No results found
          </Text>
          <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCounterparties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  personCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  personInitials: {
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
  personName: {
    fontSize: 16,
    fontWeight: "600",
  },
  personStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  netPosition: {
    marginRight: 12,
  },
  netLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  netValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: "center",
  },
});