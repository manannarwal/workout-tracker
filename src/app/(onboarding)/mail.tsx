import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const mail = () => {
  const [userEmail, setUserEmail] = useState("");

  const isValidEmail = userEmail.trim().length > 0 && 
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail.trim());

  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        {/* Top content */}
        <View>
          <Text className="text-white text-xl text-center font-semibold">
            Just a Few More Details
          </Text>
          <View className="flex-row gap-2 justify-center mt-5 -mx-3">
            <View className="border-b-4 border-green-500 w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[22%] rounded-xl"></View>
          </View>
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              What's your email?
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              This will be used to save your progress and log in.
            </Text>
          </View>
          <View className="mt-5">
            <Text className="text-white font-semibold mb-4">
              Email Address
            </Text>
            <TextInput
              className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13]"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={userEmail}
              onChangeText={setUserEmail}
              // returnKeyType="done"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View className="items-center">
                  <Pressable
                    className={`rounded-full py-4 w-full max-w-md items-center ${
                      isValidEmail
                        ? 'bg-green-500 active:opacity-80' 
                        : 'bg-gray-600 opacity-50'
                    }`}
                    onPress={() => isValidEmail && router.push("/(onboarding)/dob")}
                    disabled={!isValidEmail}
                  >
                    <Text className="text-black font-semibold text-xl">
                      Next
                    </Text>
                  </Pressable>
                </View>
      </View>
    </SafeAreaView>
  );
};

export default mail;
