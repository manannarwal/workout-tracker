import { Stack } from "expo-router";
import "../../../../global.css";

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="log-cardio" />
      <Stack.Screen name="log-strength" />
      <Stack.Screen name="log-other" />
    </Stack>
  );
}
