import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "../../contexts/OnboardingContext";

const password = () => {
  const { updateOnboardingData } = useOnboarding();
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPassword = userPassword.trim().length >= 6;
  const passwordsMatch = userPassword === confirmPassword && confirmPassword.length > 0;
  const canProceed = isValidPassword && passwordsMatch;

  const handleNext = () => {
    if (canProceed) {
      updateOnboardingData({ password: userPassword });
      router.push("/(onboarding)/dob");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        {/* Top content */}
        <View>
          <Text className="text-white text-xl text-center font-semibold">
            Secure Your Account
          </Text>
          <View className="flex-row gap-2 justify-center mt-5 -mx-3">
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[17%] rounded-xl"></View>
          </View>
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              Create a password
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              You'll use this to log in and keep your data secure.
            </Text>
          </View>
          <View className="mt-5">
            <Text className="text-white font-semibold mb-4">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13] pr-12"
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={userPassword}
                onChangeText={setUserPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                className="absolute right-4 top-6"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            <Text className="text-white font-semibold mb-4 mt-6">
              Confirm Password
            </Text>
            <View className="relative">
              <TextInput
                className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13] pr-12"
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                className="absolute right-4 top-6"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            {/* Validation Messages */}
            {userPassword.length > 0 && !isValidPassword && (
              <Text className="text-red-400 text-sm mt-2">
                Password must be at least 6 characters
              </Text>
            )}
            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text className="text-red-400 text-sm mt-2">
                Passwords do not match
              </Text>
            )}
            {canProceed && (
              <Text className="text-green-400 text-sm mt-2">
                ✓ Password confirmed
              </Text>
            )}
          </View>
        </View>

        <View className="items-center">
          <Pressable
            className={`rounded-full py-4 w-full max-w-md items-center ${
              canProceed
                ? "bg-green-500 active:opacity-80"
                : "bg-gray-600 opacity-50"
            }`}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text className="text-black font-semibold text-xl">Next</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default password;
