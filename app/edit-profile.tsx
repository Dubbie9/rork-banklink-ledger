import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, ChevronDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const COUNTRIES = [
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
];

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { profile, updateProfile, loading } = useUserProfile();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setDateOfBirth(profile.dateOfBirth);
      const country = COUNTRIES.find(c => c.code === profile.country.code) || COUNTRIES[0];
      setSelectedCountry(country);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        country: selectedCountry,
        completedAt: profile?.completedAt || new Date().toISOString(),
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { 
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1
            }
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Check size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundAccent,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundAccent,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date of Birth</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundAccent,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Country</Text>
            <Pressable
              style={[
                styles.countrySelector,
                {
                  backgroundColor: colors.backgroundAccent,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <View style={styles.countryInfo}>
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryName, { color: colors.text }]}>
                  {selectedCountry.name}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </Pressable>

            {showCountryPicker && (
              <View style={[
                styles.countryPicker,
                {
                  backgroundColor: colors.backgroundAccent,
                  borderColor: colors.border,
                }
              ]}>
                {COUNTRIES.map((country) => (
                  <Pressable
                    key={country.code}
                    style={({ pressed }) => [
                      styles.countryOption,
                      {
                        backgroundColor: pressed ? colors.background : "transparent",
                      }
                    ]}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={[styles.countryName, { color: colors.text }]}>
                      {country.name}
                    </Text>
                    {selectedCountry.code === country.code && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  countrySelector: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
  },
  countryPicker: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
});