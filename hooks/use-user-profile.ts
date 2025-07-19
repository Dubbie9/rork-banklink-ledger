import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: {
    code: string;
    name: string;
    flag: string;
  };
  completedAt: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileJson = await AsyncStorage.getItem("@banklink:user_profile");
        if (profileJson) {
          setProfile(JSON.parse(profileJson));
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem("@banklink:user_profile", JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Failed to update user profile:", err);
      setError("Failed to update profile");
      throw err;
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem("@banklink:user_profile");
      setProfile(null);
    } catch (err) {
      console.error("Failed to clear user profile:", err);
      setError("Failed to clear profile");
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    clearProfile,
  };
}