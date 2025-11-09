import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const name = () => {
  const [userName, setUserName] = useState("");
  
  const isValidName = userName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(userName.trim());
  
  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        <View>
          <Text className="text-white text-xl text-center font-semibold">
            Let's Get Started
          </Text>
          <View className="flex-row gap-2 justify-center mt-5 -mx-3">
            <View className="border-b-4 border-green-500 w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[22%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[22%] rounded-xl"></View>
          </View>
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              What should we call you?
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              Let's get started with your name.
            </Text>
          </View>
          <View className="mt-5">
            <Text className="text-white font-semibold mb-4">
              Name
            </Text>
            <TextInput
              className="border border-green-700 rounded-xl px-4 py-6 text-white bg-[#122b13]"
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={userName}
              onChangeText={setUserName}
              returnKeyType="done"
            />
          </View>
        </View>

        <View className="items-center">
          <Pressable
            className={`rounded-full py-4 w-full max-w-md items-center ${
              isValidName 
                ? 'bg-green-500 active:opacity-80' 
                : 'bg-gray-600 opacity-50'
            }`}
            onPress={() => isValidName && router.push("/(onboarding)/mail")}
            disabled={!isValidName}
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

export default name;
