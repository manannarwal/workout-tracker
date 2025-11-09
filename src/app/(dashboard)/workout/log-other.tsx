import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogOther = () => {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Log Other Workout</Text>
        </View>

        <ScrollView 
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="fitness" size={64} color="#22c55e" />
            <Text className="text-white text-xl font-bold mt-4">Coming Soon</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Custom workout logging for yoga, stretching, and other activities will be available soon.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LogOther;
