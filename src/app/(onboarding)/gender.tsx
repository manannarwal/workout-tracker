import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";

const gender = () => {
  const { signUp, updateUser, completeOnboarding } = useAuth();
  const { onboardingData, clearOnboardingData } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidSelection = selectedGender !== null;

  const handleFinish = async () => {
    if (!isValidSelection || !onboardingData.email || !onboardingData.password) {
      Alert.alert("Error", "Please complete all onboarding steps");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create account with email as username
      const result = await signUp(onboardingData.email, onboardingData.password);
      
      if (!result.success) {
        Alert.alert("Error", result.error || "Failed to create account");
        setIsSubmitting(false);
        return;
      }

      // Save additional profile data to AsyncStorage first
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Create complete profile with onboarding completion
      const completeUserData = {
        id: Date.now().toString(),
        username: onboardingData.email,
        name: onboardingData.name,
        email: onboardingData.email,
        hasCompletedOnboarding: true,
      };
      
      const profileData = {
        ...completeUserData,
        dateOfBirth: onboardingData.dateOfBirth,
        gender: selectedGender,
      };
      
      // Save to all relevant keys
      await AsyncStorage.setItem('@auth_current_user', JSON.stringify(completeUserData));
      await AsyncStorage.setItem(`@profile_${onboardingData.email}`, JSON.stringify(completeUserData));
      await AsyncStorage.setItem('@user_profile', JSON.stringify(profileData));

      // Update the auth context user state
      await updateUser(completeUserData);
      
      // Clear onboarding data from context
      clearOnboardingData();
      
      // Navigate to dashboard
      router.replace("/(dashboard)/home");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        {/* Top content */}
        <View>
          <Text className="text-white text-xl text-center font-semibold">
            One Last Step
          </Text>
          <View className="flex-row gap-2 justify-center mt-5 -mx-3">
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
          </View>
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              What's your gender?
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              This helps us create your personalised plan.
            </Text>
          </View>
          <View className="mt-5">
            <Text className="text-white font-semibold mb-4">Gender</Text>
            <View className="gap-4">
              <Pressable 
                className={`rounded-xl py-6 w-full border flex-row items-center justify-between px-4 active:opacity-80 ${
                  selectedGender === 'male' 
                    ? 'border-green-500 bg-green-700/30' 
                    : 'border-white/20 bg-green-700/10'
                }`}
                onPress={() => setSelectedGender('male')}
              >
                <Text className="text-white font-semibold text-xl">
                  Male
                </Text>
                {/* Custom Radio Button */}
                <View className="w-6 h-6 rounded-full border-2 border-white items-center justify-center">
                  {selectedGender === 'male' && (
                    <View className="w-3.5 h-3.5 rounded-full bg-green-500" />
                  )}
                </View>
              </Pressable>

              <Pressable 
                className={`rounded-xl py-6 w-full border flex-row items-center justify-between px-4 active:opacity-80 ${
                  selectedGender === 'female' 
                    ? 'border-green-500 bg-green-700/30' 
                    : 'border-white/20 bg-green-700/10'
                }`}
                onPress={() => setSelectedGender('female')}
              >
                <Text className="text-white font-semibold text-xl">
                  Female
                </Text>
                {/* Custom Radio Button */}
                <View className="w-6 h-6 rounded-full border-2 border-white items-center justify-center">
                  {selectedGender === 'female' && (
                    <View className="w-3.5 h-3.5 rounded-full bg-green-500" />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="items-center">
          <Pressable
            className={`rounded-full py-4 w-full max-w-md items-center ${
              isValidSelection && !isSubmitting
                ? "bg-green-500 active:opacity-80"
                : "bg-gray-600 opacity-50"
            }`}
            onPress={handleFinish}
            disabled={!isValidSelection || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-semibold text-xl">Finish</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default gender;
