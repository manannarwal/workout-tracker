import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COMPLETED_WORKOUTS_KEY = '@completed_workouts';

const LogCardio = () => {
  const [activityName, setActivityName] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  const isValidWorkout = activityName.trim().length > 0 && 
                         distance.trim().length > 0 && 
                         duration.trim().length > 0;

  const handleSave = async () => {
    if (isValidWorkout) {
      const completedWorkout = {
        id: Date.now().toString(),
        type: 'cardio' as const,
        activityName,
        distance,
        duration,
        calories: calories || '0',
        timestamp: new Date().toISOString(),
      };

      try {
        // Save to completed workouts
        const existingData = await AsyncStorage.getItem(COMPLETED_WORKOUTS_KEY);
        const completedWorkouts = existingData ? JSON.parse(existingData) : [];
        completedWorkouts.unshift(completedWorkout); // Add to beginning
        await AsyncStorage.setItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(completedWorkouts));
        
        console.log("Cardio workout saved successfully:", completedWorkout);
        router.back();
      } catch (error) {
        console.error('Error saving cardio workout:', error);
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Log Cardio Workout</Text>
        </View>

        <ScrollView 
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Activity Name */}
          <View className="mt-6">
            <Text className="text-white font-semibold mb-2">Activity Name</Text>
            <TextInput
              className="bg-[#1a1a1a] rounded-xl px-4 py-4 text-white border border-[#2a2a2a]"
              placeholder="e.g Morning Run"
              placeholderTextColor="#6b7280"
              value={activityName}
              onChangeText={setActivityName}
            />
          </View>

          {/* Distance */}
          <View className="mt-4">
            <Text className="text-white font-semibold mb-2">Distance (km)</Text>
            <TextInput
              className="bg-[#1a1a1a] rounded-xl px-4 py-4 text-white border border-[#2a2a2a]"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
            />
          </View>

          {/* Duration */}
          <View className="mt-4">
            <Text className="text-white font-semibold mb-2">Duration (minutes)</Text>
            <TextInput
              className="bg-[#1a1a1a] rounded-xl px-4 py-4 text-white border border-[#2a2a2a]"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          {/* Calories (Optional) */}
          <View className="mt-4">
            <Text className="text-white font-semibold mb-2">Calories Burned (optional)</Text>
            <TextInput
              className="bg-[#1a1a1a] rounded-xl px-4 py-4 text-white border border-[#2a2a2a]"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={calories}
              onChangeText={setCalories}
            />
            <Text className="text-gray-400 text-xs mt-1">
              Leave blank to auto-calculate based on distance and duration
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-5 pb-6 pt-4 border-t border-[#1a1a1a]">
          <Pressable
            onPress={handleSave}
            disabled={!isValidWorkout}
            className={`rounded-xl py-4 items-center ${
              isValidWorkout 
                ? 'bg-green-500 active:opacity-80' 
                : 'bg-gray-600 opacity-50'
            }`}
          >
            <Text className="text-black font-bold text-lg">Save Workout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LogCardio;
