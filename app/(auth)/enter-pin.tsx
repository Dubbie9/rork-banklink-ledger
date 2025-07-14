import { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function EnterPin() {
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");
  const { pin, authenticated, setAuthenticated } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handleNumberPress = (number: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (enteredPin.length < 4) {
      const newPin = enteredPin + number;
      setEnteredPin(newPin);
      
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (enteredPin.length > 0) {
      setEnteredPin(prev => prev.slice(0, -1));
    }
  };

  const validatePin = (pinToValidate: string) => {
    if (pinToValidate === pin) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setAuthenticated(true);
      router.replace("/(app)");
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setError("Incorrect PIN. Try again.");
      setEnteredPin("");
      shakeError();
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Lock size={40} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Enter PIN</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your 4-digit PIN to unlock the app
        </Text>
      </View>

      <Animated.View 
        style={[
          styles.pinContainer, 
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        {[0, 1, 2, 3].map((index) => {
          const isFilled = index < enteredPin.length;
          
          return (
            <View 
              key={index} 
              style={[
                styles.pinDot, 
                { 
                  backgroundColor: isFilled ? colors.primary : colors.backgroundAccent,
                  borderColor: isFilled ? colors.primary : colors.border
                }
              ]} 
            />
          );
        })}
      </Animated.View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.keypadContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <Pressable
            key={number}
            style={({ pressed }) => [
              styles.keypadButton,
              { 
                backgroundColor: pressed ? colors.backgroundAccent : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => handleNumberPress(number.toString())}
          >
            <Text style={[styles.keypadButtonText, { color: colors.text }]}>
              {number}
            </Text>
          </Pressable>
        ))}
        <View style={styles.keypadButton} />
        <Pressable
          style={({ pressed }) => [
            styles.keypadButton,
            { 
              backgroundColor: pressed ? colors.backgroundAccent : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={() => handleNumberPress("0")}
        >
          <Text style={[styles.keypadButtonText, { color: colors.text }]}>0</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.keypadButton,
            { 
              backgroundColor: pressed ? colors.backgroundAccent : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={handleDelete}
        >
          <Text style={[styles.keypadButtonText, { color: colors.text }]}>⌫</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 12,
    borderWidth: 1,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 24,
  },
  spacer: {
    height: 24,
  },
  keypadContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  keypadButton: {
    width: "30%",
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: "500",
  },
});