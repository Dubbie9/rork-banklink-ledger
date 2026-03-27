import { View, Text, StyleSheet, Switch, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useBanks } from "@/hooks/use-banks";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useRouter } from "expo-router";
import { 
  Moon, 
  Lock, 
  Shield, 
  FileText, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Fingerprint,
  Smartphone
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, followSystem, setFollowSystem } = useTheme();
  const { logout } = useAuth();
  const { user, logout: firebaseLogout } = useFirebaseAuth();
  const { clearAllBanks } = useBanks();
  const { isSupported, isEnabled, biometricType, enableBiometric, disableBiometric } = useBiometricAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? You'll need to enter your PIN to access the app again.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            logout();
            if (user) {
              firebaseLogout();
            }
            router.replace("/(auth)");
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all your data? This will remove all connected banks and transaction history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            clearAllBanks();
            Alert.alert("Data Cleared", "All your data has been removed from the app.");
          }
        }
      ]
    );
  };

  const handleChangePin = () => {
    // Authentication enforcement
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to change your PIN.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/(auth)/login") }
        ]
      );
      return;
    }
    
    router.push("/(auth)/create-pin");
  };

  const handleBiometricToggle = async () => {
    if (isEnabled) {
      Alert.alert(
        `Disable ${biometricType}?`,
        `You will need to enter your PIN to unlock the app.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => {
              disableBiometric();
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          }
        ]
      );
    } else {
      const success = await enableBiometric();
      if (success && Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleFollowSystemToggle = () => {
    setFollowSystem(!followSystem);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        { 
          backgroundColor: pressed && onPress ? colors.backgroundAccent : colors.background,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        {icon}
        <Text style={[styles.settingItemTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your app preferences
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          {renderSettingItem(
            <Smartphone size={22} color={colors.primary} style={styles.settingIcon} />,
            "Follow System Theme",
            <Switch
              value={followSystem}
              onValueChange={handleFollowSystemToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={followSystem ? colors.primary : colors.backgroundAccent}
            />
          )}
          {!followSystem && renderSettingItem(
            <Moon size={22} color={colors.primary} style={styles.settingIcon} />,
            "Dark Mode",
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : colors.backgroundAccent}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
          {renderSettingItem(
            <Lock size={22} color={colors.primary} style={styles.settingIcon} />,
            "Change PIN",
            <ChevronRight size={20} color={colors.textSecondary} />,
            handleChangePin
          )}
          {isSupported && renderSettingItem(
            <Fingerprint size={22} color={colors.primary} style={styles.settingIcon} />,
            biometricType,
            <Switch
              value={isEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isEnabled ? colors.primary : colors.backgroundAccent}
            />
          )}
          {renderSettingItem(
            <Shield size={22} color={colors.primary} style={styles.settingIcon} />,
            "Clear All Data",
            <ChevronRight size={20} color={colors.textSecondary} />,
            handleClearData
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          {renderSettingItem(
            <FileText size={22} color={colors.primary} style={styles.settingIcon} />,
            "Privacy Policy",
            <ChevronRight size={20} color={colors.textSecondary} />,
            () => {}
          )}
          {renderSettingItem(
            <HelpCircle size={22} color={colors.primary} style={styles.settingIcon} />,
            "Help & Support",
            <ChevronRight size={20} color={colors.textSecondary} />,
            () => {}
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { 
              backgroundColor: colors.errorLight,
              opacity: pressed ? 0.9 : 1
            }
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutButtonText, { color: colors.error }]}>Log Out</Text>
        </Pressable>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          BankLink Ledger v1.0.0
        </Text>
      </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 24,
  },
});