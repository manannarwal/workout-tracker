import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CALORIES_KEY = "@consumed_calories";
const PROFILE_KEY = "@user_profile";

type FoodItem = {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
};

type ConsumedFood = FoodItem & {
  consumedAt: string;
  quantity: number;
};

const Calories = () => {
  const [consumedFoods, setConsumedFoods] = useState<ConsumedFood[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [caloriesData, profileData] = await Promise.all([
        AsyncStorage.getItem(CALORIES_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);

      if (caloriesData) {
        const foods: ConsumedFood[] = JSON.parse(caloriesData);
        // Filter today's foods
        const today = new Date().toDateString();
        const todayFoods = foods.filter((f) => new Date(f.consumedAt).toDateString() === today);
        setConsumedFoods(todayFoods);
      }

      if (profileData) {
        const profile = JSON.parse(profileData);
        setDailyGoal(profile.dailyCalorieGoal || 2000);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const deleteFood = async (index: number) => {
    try {
      const updatedFoods = consumedFoods.filter((_, i) => i !== index);
      setConsumedFoods(updatedFoods);

      // Update storage
      const existingData = await AsyncStorage.getItem(CALORIES_KEY);
      const allStoredFoods = existingData ? JSON.parse(existingData) : [];
      const today = new Date().toDateString();
      const otherDaysFoods = allStoredFoods.filter(
        (f: ConsumedFood) => new Date(f.consumedAt).toDateString() !== today
      );
      await AsyncStorage.setItem(CALORIES_KEY, JSON.stringify([...otherDaysFoods, ...updatedFoods]));
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  const getTotalNutrition = () => {
    return consumedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const totals = getTotalNutrition();
  const calorieProgress = Math.min((totals.calories / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - totals.calories, 0);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-white text-3xl font-bold">Calories</Text>
          <Text className="text-gray-400 text-sm mt-1">Track your daily nutrition</Text>
        </View>

        {/* Daily Summary Card */}
        <View className="px-5 mb-6">
          <View className="bg-[#1a1a1a] rounded-3xl p-6 border border-[#2a2a2a]">
            {/* Calorie Progress */}
            <View className="items-center mb-6">
              <View className="relative w-40 h-40 items-center justify-center">
                {/* Progress Circle */}
                <View className="absolute w-40 h-40 rounded-full border-8 border-[#2a2a2a]" />
                <View
                  className="absolute w-40 h-40 rounded-full border-8 border-green-500"
                  style={{
                    borderColor: totals.calories > dailyGoal ? "#ef4444" : "#22c55e",
                    transform: [{ rotate: "-90deg" }],
                    borderTopColor: "transparent",
                    borderRightColor: calorieProgress >= 25 ? (totals.calories > dailyGoal ? "#ef4444" : "#22c55e") : "transparent",
                    borderBottomColor: calorieProgress >= 50 ? (totals.calories > dailyGoal ? "#ef4444" : "#22c55e") : "transparent",
                    borderLeftColor: calorieProgress >= 75 ? (totals.calories > dailyGoal ? "#ef4444" : "#22c55e") : "transparent",
                  }}
                />
                <View className="items-center">
                  <Text className="text-white text-4xl font-bold">{totals.calories}</Text>
                  <Text className="text-gray-400 text-sm">/ {dailyGoal} kcal</Text>
                </View>
              </View>
              <Text className={`text-lg font-semibold mt-4 ${totals.calories > dailyGoal ? "text-red-500" : "text-green-500"}`}>
                {remaining} kcal remaining
              </Text>
            </View>

            {/* Macros */}
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="water" size={24} color="#3b82f6" />
                </View>
                <Text className="text-blue-500 text-2xl font-bold">{totals.protein.toFixed(1)}g</Text>
                <Text className="text-gray-400 text-xs">Protein</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-yellow-500/20 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="nutrition" size={24} color="#eab308" />
                </View>
                <Text className="text-yellow-500 text-2xl font-bold">{totals.carbs.toFixed(1)}g</Text>
                <Text className="text-gray-400 text-xs">Carbs</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-red-500/20 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="flame" size={24} color="#ef4444" />
                </View>
                <Text className="text-red-500 text-2xl font-bold">{totals.fats.toFixed(1)}g</Text>
                <Text className="text-gray-400 text-xs">Fats</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Food Button */}
        <View className="px-5 mb-4">
          <Pressable
            onPress={() => router.push('/calories/add-food')}
            className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
          >
            <Ionicons name="add-circle-outline" size={24} color="#000" />
            <Text className="text-black font-bold text-lg ml-2">Add Food</Text>
          </Pressable>
        </View>

        {/* Today's Meals */}
        <View className="px-5 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Today's Meals</Text>
          {consumedFoods.length === 0 ? (
            <View className="bg-[#1a1a1a] rounded-2xl p-8 items-center border border-[#2a2a2a]">
              <Ionicons name="restaurant-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-center mt-4">
                No meals logged yet.{"\n"}Start tracking your nutrition!
              </Text>
            </View>
          ) : (
            consumedFoods.map((food, index) => (
              <View key={index} className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-[#2a2a2a]">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold">{food.name}</Text>
                    <Text className="text-gray-400 text-sm">{food.category}</Text>
                    {food.quantity > 1 && (
                      <Text className="text-green-500 text-sm">Qty: {food.quantity}x</Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-green-500 text-xl font-bold">{food.calories.toFixed(0)} kcal</Text>
                    <Pressable onPress={() => deleteFood(index)} className="mt-2 active:opacity-70">
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
                <View className="flex-row justify-between pt-3 border-t border-[#2a2a2a]">
                  <Text className="text-blue-400 text-sm">P: {food.protein.toFixed(1)}g</Text>
                  <Text className="text-yellow-400 text-sm">C: {food.carbs.toFixed(1)}g</Text>
                  <Text className="text-red-400 text-sm">F: {food.fats.toFixed(1)}g</Text>
                  <Text className="text-gray-400 text-sm">{new Date(food.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Calories;
