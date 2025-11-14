import { Stack } from "expo-router";
import "../../../../global.css";
import { View } from "react-native";

export default function WorkoutLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="log-cardio" />
        <Stack.Screen name="log-strength" />
        <Stack.Screen name="log-other" />
        <Stack.Screen name="detail" />
      </Stack>
    </View>
  );
}
