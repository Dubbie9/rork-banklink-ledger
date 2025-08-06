import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { ArrowLeft, User, Calendar, Globe } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COUNTRIES = [
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "be", name: "Belgium", flag: "🇧🇪" },
  { code: "at", name: "Austria", flag: "🇦🇹" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "ie", name: "Ireland", flag: "🇮🇪" },
  { code: "fi", name: "Finland", flag: "🇫🇮" },
  { code: "dk", name: "Denmark", flag: "🇩🇰" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "no", name: "Norway", flag: "🇳🇴" },
  { code: "pl", name: "Poland", flag: "🇵🇱" },
  { code: "lv", name: "Latvia", flag: "🇱🇻" },
  { code: "lt", name: "Lithuania", flag: "🇱🇹" },
  { code: "ee", name: "Estonia", flag: "🇪🇪" },
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useFirebaseAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleCompleteProfile = async () => {
    if (!firstName || !lastName || !dateOfBirth || !selectedCountry) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    // Basic date validation (DD/MM/YYYY format)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert("Error", "Please enter date in DD/MM/YYYY format");
      return;
    }
    
    // Check if user is at least 18 years old
    const [day, month, year] = dateOfBirth.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      Alert.alert("Error", "You must be at least 18 years old to use this service");
      return;
    }
    
    setLoading(true);
    try {
      // Save profile data to AsyncStorage
      const profileData = {
        firstName,
        lastName,
        dateOfBirth,
        country: selectedCountry,
        completedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem("@banklink:user_profile", JSON.stringify(profileData));
      
      // Update user data in Firebase auth storage
      if (user) {
        const updatedUser = {
          ...user,
          firstName,
          displayName: `${firstName} ${lastName}`,
          profile: profileData,
        };
        await AsyncStorage.setItem("@banklink:firebase_user", JSON.stringify(updatedUser));
      }
      
      // Pre-fetch banks for the selected country to ensure they're available
      try {
        console.log(`Pre-fetching banks for country: ${selectedCountry.code}`);
        // This will cache the banks for later use
        // Note: We'll need to get the access token first, but for now we'll skip this step
        // The banks will be fetched when the user navigates to the banks screen
      } catch (error) {
        console.warn('Failed to pre-fetch banks:', error);
        // Don't block the flow if bank fetching fails
      }
      
      // Navigate to PIN creation
      router.replace("/(auth)/create-pin");
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const formatDateInput = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add slashes automatically
    if (cleaned.length >= 2 && cleaned.length < 4) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else if (cleaned.length >= 4) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    return cleaned;
  };
  
  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateOfBirth(formatted);
  };
  
  if (showCountryPicker) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => setShowCountryPicker(false)}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Select Country</Text>
        </View>
        
        <ScrollView style={styles.countryList}>
          {COUNTRIES.map((country) => (
            <Pressable
              key={country.code}
              style={({ pressed }) => [
                styles.countryItem,
                { 
                  backgroundColor: pressed ? colors.backgroundAccent : colors.background,
                  borderBottomColor: colors.border 
                }
              ]}
              onPress={() => {
                setSelectedCountry(country);
                setShowCountryPicker(false);
              }}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We need a few more details to set up your account and show you available banks in your country.
          </Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date of Birth</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}>
              <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textSecondary}
                value={dateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              You must be at least 18 years old
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Country</Text>
            <Pressable
              style={[styles.inputContainer, { backgroundColor: colors.backgroundAccent, borderColor: colors.border }]}
              onPress={() => setShowCountryPicker(true)}
            >
              <Globe size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Text style={[
                styles.input, 
                { 
                  color: selectedCountry ? colors.text : colors.textSecondary,
                  paddingTop: 0,
                  paddingBottom: 0,
                }
              ]}>
                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "Select your country"}
              </Text>
            </Pressable>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              This helps us show you banks available in your region. We support banks in {COUNTRIES.length} European countries.
            </Text>
          </View>
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            { 
              backgroundColor: colors.primary, 
              opacity: pressed ? 0.9 : 1,
              marginTop: 40,
              marginBottom: 40,
            }
          ]}
          onPress={handleCompleteProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerSection: {
    marginBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    flex: 1,
    textAlign: "center",
    marginLeft: -40, // Compensate for back button
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
  },
  continueButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryName: {
    fontSize: 16,
    flex: 1,
  },
});