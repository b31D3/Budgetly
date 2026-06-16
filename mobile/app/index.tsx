import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_KEY } from "../constants/storage";

export default function Index() {
  const { currentUser, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
        setOnboardingDone(val === "true");
        setCheckingOnboarding(false);
      });
    } else if (!loading) {
      setCheckingOnboarding(false);
    }
  }, [loading, currentUser]);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (currentUser) {
    if (!onboardingDone) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
