import { Stack } from "expo-router";
import "../../../global.css";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="getstarted" />
      <Stack.Screen name="name" />
      <Stack.Screen name="mail" />
    </Stack>
  );
}
