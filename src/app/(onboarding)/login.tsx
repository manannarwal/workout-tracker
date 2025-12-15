import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

const login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = email.trim().length > 0 && 
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  const canSubmit = isValidEmail && password.length >= 6;

  const handleLogin = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      
      if (!result.success) {
        Alert.alert("Login Failed", result.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      console.log('Login successful, waiting for state update...');
      
      // Give a small delay to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to dashboard directly
      router.replace("/(dashboard)/home");
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        <View>
          <Text className="text-white text-xl text-center font-semibold mt-8">
            Welcome Back
          </Text>
          
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              Login to your account
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              Enter your credentials to continue
            </Text>
          </View>

          <View className="mt-8">
            <Text className="text-white font-semibold mb-4">
              Email Address
            </Text>
            <TextInput
              className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13]"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View className="mt-6">
            <Text className="text-white font-semibold mb-4">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13] pr-12"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable
                className="absolute right-4 top-6"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>

          <Pressable 
            className="mt-4"
            onPress={() => router.push("/(onboarding)/getstarted")}
            disabled={isLoading}
          >
            <Text className="text-green-400 text-sm">
              Don't have an account? Sign up
            </Text>
          </Pressable>
        </View>

        <View className="items-center">
          <Pressable
            className={`rounded-full py-4 w-full max-w-md items-center ${
              canSubmit && !isLoading
                ? "bg-green-500 active:opacity-80"
                : "bg-gray-600 opacity-50"
            }`}
            onPress={handleLogin}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-semibold text-xl">Login</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default login;
