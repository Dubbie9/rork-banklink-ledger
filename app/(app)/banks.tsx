import { View, Text, StyleSheet, FlatList, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useRealBanks } from "@/hooks/use-real-banks";
import { useBankConnection } from "@/hooks/use-bank-connection";
import { Bank } from "@/types";
import { Plus, RefreshCw, Trash2, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import BankLogo from "@/components/BankLogo";

// Mock connected banks for now - in real implementation, this would come from your backend
const mockConnectedBanks = [
  {
    id: "REVOLUT_REVOGB21",
    name: "Revolut",
    color: "#191C1F",
    logoUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop&crop=center",
    accountNumber: "****1234",
    lastUpdated: "Today",
    transactionCount: 45,
    requisitionId: "req_123",
  },
];

export default function BanksScreen() {
  const { colors } = useTheme();
  const { banks: availableBanks, loading: banksLoading, error: banksError, refetch } = useRealBanks();
  const { disconnectBank } = useBankConnection();
  const router = useRouter();
  const { user } = useFirebaseAuth();

  const handleAddBank = (bank: Bank) => {
    // Authentication enforcement
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
    
    router.push(`/bank-connect/${bank.id}`);
  };

  const handleBankPress = (bankId: string) => {
    router.push(`/bank/${bankId}`);
  };

  const handleRefreshBank = (bankId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // In real implementation, this would refresh transactions for the specific bank
    Alert.alert(
      "Bank Refreshed",
      "Your transactions have been updated with the latest data.",
      [{ text: "OK" }]
    );
  };

  const handleRemoveBank = (bankId: string, bankName: string, requisitionId: string) => {
    Alert.alert(
      "Remove Bank",
      `Are you sure you want to remove ${bankName}? This will delete all associated transaction data.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await disconnectBank(requisitionId);
              
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert("Bank Removed", `${bankName} has been disconnected successfully.`);
            } catch (error) {
              Alert.alert("Error", "Failed to disconnect bank. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderConnectedBank = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [
        styles.bankCard,
        { 
          backgroundColor: colors.backgroundAccent,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1
        }
      ]}
      onPress={() => handleBankPress(item.id)}
    >
      <View style={styles.bankHeader}>
        <View style={styles.bankInfo}>
          <BankLogo 
            logoUrl={item.logoUrl} 
            bankName={item.name} 
            fallbackColor={item.color} 
          />
          <View>
            <Text style={[styles.bankName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
              {item.accountNumber}
            </Text>
          </View>
        </View>
        <View style={styles.bankActions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundAccent, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleRefreshBank(item.id);
            }}
          >
            <RefreshCw size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundAccent, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleRemoveBank(item.id, item.name, item.requisitionId);
            }}
          >
            <Trash2 size={20} color={colors.error} />
          </Pressable>
          <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.bankStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Updated</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{item.lastUpdated}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transactions</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{item.transactionCount}</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderAvailableBank = ({ item }: { item: Bank }) => {
    const isConnected = mockConnectedBanks.some(bank => bank.id === item.id);
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.availableBankCard,
          { 
            backgroundColor: colors.backgroundAccent,
            borderColor: colors.border,
            opacity: pressed ? 0.9 : 1
          }
        ]}
        onPress={() => !isConnected && handleAddBank(item)}
        disabled={isConnected}
      >
        <View style={styles.availableBankInfo}>
          <BankLogo 
            logoUrl={item.logoUrl} 
            bankName={item.name} 
            size={32} 
            fallbackColor={item.color} 
          />
          <Text style={[styles.availableBankName, { color: colors.text }]}>{item.name}</Text>
        </View>
        {isConnected ? (
          <Text style={[styles.connectedLabel, { color: colors.success }]}>Connected</Text>
        ) : (
          <View style={[styles.addButton, { backgroundColor: colors.primaryLight }]}>
            <Plus size={16} color={colors.primary} />
          </View>
        )}
      </Pressable>
    );
  };

  if (banksError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Banks</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your connected bank accounts
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load available banks
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={refetch}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Banks</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your connected bank accounts
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mockConnectedBanks.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Banks</Text>
            <FlatList
              data={mockConnectedBanks}
              renderItem={renderConnectedBank}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.connectedBanksList}
              scrollEnabled={false}
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: mockConnectedBanks.length > 0 ? 24 : 0 }]}>
          Available Banks
        </Text>
        
        {banksLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading available banks...
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableBanks}
            renderItem={renderAvailableBank}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.bankGrid}
            contentContainerStyle={styles.availableBanksList}
            scrollEnabled={false}
          />
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  connectedBanksList: {
    paddingBottom: 8,
  },
  bankCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  accountNumber: {
    fontSize: 14,
    marginLeft: 12,
  },
  bankActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  bankStats: {
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  availableBanksList: {
    paddingBottom: 20,
  },
  bankGrid: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  availableBankCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  availableBankInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  availableBankName: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  connectedLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
});