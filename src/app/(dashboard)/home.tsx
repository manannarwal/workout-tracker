import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const home = () => {
  return (
    <SafeAreaView>
      <View className="bg-gray-700 w-full h-full mt-50">
        <Text className="text-white text-2xl text-center">
          Welcome to Dashboard
        </Text>
      <Pressable
        className="rounded-full py-4 w-full max-w-md items-center bg-white"
        onPress={() => router.replace("/(onboarding)/getstarted")}
        >
        <Text className="text-black font-semibold text-xl">Go Back to Home</Text>
      </Pressable>
        </View>
    </SafeAreaView>
  );
};

export default home;
