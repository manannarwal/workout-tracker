import { Stack } from "expo-router";
import { View } from "react-native";
import "../../../../global.css";

export default function ProfileLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="account-details" />
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="app-settings" />
      </Stack>
    </View>
  );
}
