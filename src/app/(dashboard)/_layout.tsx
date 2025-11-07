import { Stack } from "expo-router";
import "../../../global.css";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="home" />
    </Stack>
  );
}
