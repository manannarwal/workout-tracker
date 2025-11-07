import { Stack } from "expo-router";
import "../../../global.css";
import { View } from "react-native";

export default function OnboardingLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a3117' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a3117" },
        }}
      >
        <Stack.Screen name="getstarted" />
        <Stack.Screen name="name" />
        <Stack.Screen name="mail" />
        <Stack.Screen name="dob" />
        <Stack.Screen name="gender" />
      </Stack>
    </View>
  );
}
