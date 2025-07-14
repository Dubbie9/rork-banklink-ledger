import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface Subscription {
  isPro: boolean;
  plan: "monthly" | "annual" | null;
  startDate: string | null;
  nextBillingDate: string | null;
}

interface SubscriptionState {
  subscription: Subscription;
  subscribe: (plan: "monthly" | "annual") => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

// Helper to get a date X months in the future
const getDateInFuture = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscription: {
        isPro: false,
        plan: null,
        startDate: null,
        nextBillingDate: null,
      },
      subscribe: async (plan: "monthly" | "annual") => {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const today = new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        
        const nextBillingDate = getDateInFuture(plan === "monthly" ? 1 : 12);
        
        set({
          subscription: {
            isPro: true,
            plan,
            startDate: today,
            nextBillingDate,
          },
        });
      },
      cancelSubscription: async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          subscription: {
            isPro: false,
            plan: null,
            startDate: null,
            nextBillingDate: null,
          },
        });
      },
    }),
    {
      name: "banklink-subscription",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useSubscription() {
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { subscription, subscribe, cancelSubscription } = useSubscriptionStore();
  
  useEffect(() => {
    // Simulate loading subscription data
    const timer = setTimeout(() => {
      setIsSubscriptionLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    subscription,
    subscribe,
    cancelSubscription,
    isSubscriptionLoading,
  };
}