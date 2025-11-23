import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COMPLETED_WORKOUTS_KEY = '@completed_workouts';

const LogCardio = () => {
  const { activity, workoutType } = useLocalSearchParams<{ activity?: string; workoutType?: string }>();
  const [activityName, setActivityName] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  const isValidWorkout = activityName.trim().length > 0 && 
                         distance.trim().length > 0 && 
                         duration.trim().length > 0;

  // Calculate calories based on activity type, distance, and duration
  const calculateCalories = () => {
    if (!distance || !duration) return 0;

    const distanceKm = parseFloat(distance);
    const durationMin = parseFloat(duration);
    
    if (isNaN(distanceKm) || isNaN(durationMin) || durationMin === 0) return 0;

    // Use workoutType if available, otherwise fall back to activityName
    const activityType = workoutType || activityName.toLowerCase();
    const weightKg = 70; // Average weight
    
    // Calculate average speed in km/h
    const speedKmh = (distanceKm / durationMin) * 60;
    
    // === PRIMARY METHOD: Distance-based calculation ===
    // Formula: calories = coefficient × weight_kg × distance_km
    // Coefficient represents kcal per kg per km and depends on activity type and speed
    
    let coefficient = 1.0; // Default
    let met = 6.0; // For secondary MET-based check
    
    if (activityType.includes('walk')) {
      if (speedKmh < 4) {
        coefficient = 0.55; // Slow walk
        met = 2.5;
      } else if (speedKmh < 6) {
        coefficient = 0.70; // Moderate walk (4-6 km/h)
        met = 3.5;
      } else {
        coefficient = 0.85; // Fast walk (>6 km/h)
        met = 4.5;
      }
    } else if (activityType.includes('run') || activityType.includes('jog')) {
      if (speedKmh < 6) {
        coefficient = 0.90; // Slow jog (<6 km/h)
        met = 6.0;
      } else if (speedKmh < 12) {
        coefficient = 1.00; // Running (6-12 km/h)
        met = 10.0;
      } else if (speedKmh < 14) {
        coefficient = 1.10; // Fast running (12-14 km/h)
        met = 11.5;
      } else {
        coefficient = 1.35; // Very fast running (>14 km/h)
        met = 14.0;
      }
    } else if (activityType.includes('ride') || activityType.includes('cycl') || activityType.includes('bike')) {
      if (speedKmh < 15) {
        coefficient = 0.35; // Slow cycling
        met = 4.0;
      } else if (speedKmh < 22) {
        coefficient = 0.45; // Moderate cycling (15-22 km/h)
        met = 6.5;
      } else {
        coefficient = 0.60; // Fast cycling (>22 km/h)
        met = 10.0;
      }
    } else {
      // Default for unknown activities
      coefficient = 0.80;
      met = 6.0;
    }

    // Distance-based calories (PRIMARY)
    const distanceCalories = coefficient * weightKg * distanceKm;
    
    // === SECONDARY METHOD: MET-based calculation for validation ===
    // Formula: kcal_per_min = (MET × 3.5 × weight_kg) / 200
    const caloriesPerMin = (met * 3.5 * weightKg) / 200;
    const metCalories = caloriesPerMin * durationMin;
    
    // Compare both methods - if they differ greatly, average them
    const percentDifference = Math.abs(distanceCalories - metCalories) / distanceCalories * 100;
    
    let finalCalories;
    if (percentDifference <= 20) {
      // Methods agree within 20% - use distance-based (more accurate for distance activities)
      finalCalories = distanceCalories;
    } else {
      // Methods differ significantly - use average for safety
      finalCalories = (distanceCalories + metCalories) / 2;
    }
    
    return Math.round(finalCalories);
  };

  const handleSave = async () => {
    if (isValidWorkout) {
      const finalCalories = calories ? calories : calculateCalories().toString();
      
      const completedWorkout = {
        id: Date.now().toString(),
        type: 'cardio' as const,
        workoutType: workoutType as "walk" | "run" | "ride" | "other" | undefined,
        activityName,
        distance,
        duration,
        calories: finalCalories,
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
              Leave blank to auto-calculate ({calculateCalories()} kcal estimated)
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
