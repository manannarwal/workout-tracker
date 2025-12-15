import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { AuthProvider } from "../contexts/AuthContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
