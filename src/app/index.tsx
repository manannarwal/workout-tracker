import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();

  console.log('Index.tsx - isLoading:', isLoading);
  console.log('Index.tsx - isAuthenticated:', isAuthenticated);
  console.log('Index.tsx - user:', user);
  console.log('Index.tsx - hasCompletedOnboarding:', user?.hasCompletedOnboarding);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0a3117] items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // If authenticated and completed onboarding, go to dashboard
  if (isAuthenticated && user?.hasCompletedOnboarding) {
    console.log('Index.tsx - Redirecting to dashboard');
    return <Redirect href="/(dashboard)/home" />;
  }

  // If authenticated but hasn't completed onboarding, continue onboarding
  if (isAuthenticated && !user?.hasCompletedOnboarding) {
    console.log('Index.tsx - Redirecting to onboarding/name');
    return <Redirect href="/(onboarding)/name" />;
  }

  // Not authenticated, show get started screen
  console.log('Index.tsx - Redirecting to getstarted');
  return <Redirect href="/(onboarding)/getstarted" />;
}
