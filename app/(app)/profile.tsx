import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useBanks } from "@/hooks/use-banks";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter } from "expo-router";
import { Building2, CreditCard, LogOut, ChevronRight, Crown, Edit3, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout, isLoading } = useFirebaseAuth();
  const { subscription, isSubscriptionLoading } = useSubscription();
  const { banks } = useBanks();
  const { profile } = useUserProfile();
  const router = useRouter();
  
  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    await logout();
    router.replace("/(auth)");
  };
  
  const handleManageBanks = () => {
    router.push("/banks");
  };
  
  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  const handleEditProfile = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/edit-profile");
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.notLoggedInContainer}>
          <Text style={[styles.notLoggedInTitle, { color: colors.text }]}>
            Not Logged In
          </Text>
          <Text style={[styles.notLoggedInDescription, { color: colors.textSecondary }]}>
            Please log in to view your profile
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your account
        </Text>
      </View>
      
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            { 
              backgroundColor: colors.backgroundAccent, 
              borderColor: colors.border,
              opacity: pressed ? 0.95 : 1
            }
          ]}
          onPress={handleEditProfile}
        >
          <View style={styles.profileInfo}>
            <View style={[styles.profileInitials, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.initialsText, { color: colors.primary }]}>
                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 
                 user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {profile ? `${profile.firstName} ${profile.lastName}` : user?.displayName || "User"}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              {profile?.country && (
                <Text style={[styles.profileCountry, { color: colors.textSecondary }]}>
                  {profile.country.flag} {profile.country.name}
                </Text>
              )}
            </View>
            <Edit3 size={20} color={colors.textSecondary} style={styles.editIcon} />
          </View>
          
          {!isSubscriptionLoading && (
            <View style={[
              styles.subscriptionBadge, 
              { 
                backgroundColor: subscription?.isPro ? colors.primaryLight : colors.backgroundAccent,
                borderColor: subscription?.isPro ? colors.primary : colors.border
              }
            ]}>
              {subscription?.isPro ? (
                <>
                  <Crown size={14} color={colors.primary} style={styles.badgeIcon} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Pro</Text>
                </>
              ) : (
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Free</Text>
              )}
            </View>
          )}
        </Pressable>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { 
                backgroundColor: pressed ? colors.backgroundAccent : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={handleManageBanks}
          >
            <View style={styles.menuItemLeft}>
              <Building2 size={22} color={colors.primary} style={styles.menuItemIcon} />
              <View>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>Connected Banks</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {banks.length} {banks.length === 1 ? "bank" : "banks"} connected
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>
          
          {!subscription?.isPro && (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { 
                  backgroundColor: pressed ? colors.backgroundAccent : colors.background,
                  borderColor: colors.border
                }
              ]}
              onPress={handleUpgrade}
            >
              <View style={styles.menuItemLeft}>
                <Crown size={22} color={colors.primary} style={styles.menuItemIcon} />
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>Upgrade to Pro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    Get premium features
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </Pressable>
          )}
          
          {subscription?.isPro && (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { 
                  backgroundColor: pressed ? colors.backgroundAccent : colors.background,
                  borderColor: colors.border
                }
              ]}
              onPress={() => router.push("/subscription")}
            >
              <View style={styles.menuItemLeft}>
                <CreditCard size={22} color={colors.primary} style={styles.menuItemIcon} />
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>Manage Subscription</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {subscription?.plan === "monthly" ? "Monthly" : "Annual"} plan
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </Pressable>
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
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInitials: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: "600",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  profileCountry: {
    fontSize: 14,
    marginTop: 2,
  },
  editIcon: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  subscriptionBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  notLoggedInDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});