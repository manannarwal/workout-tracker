import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Add logic here to check if user has completed onboarding
  // For now, always redirect to onboarding
//   return <Redirect href="/(onboarding)/getstarted" />;
  return <Redirect href="/(dashboard)/home" />;
}
