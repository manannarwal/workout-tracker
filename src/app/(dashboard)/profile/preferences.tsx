import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_KEY = "@user_profile";

const Preferences = () => {
  const [goalWeight, setGoalWeight] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("2000");
  const [dailyCalorieBurnGoal, setDailyCalorieBurnGoal] = useState("600");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        const profile = JSON.parse(data);
        setGoalWeight(profile.goalWeight || "");
        setDailyCalorieGoal(profile.dailyCalorieGoal?.toString() || "2000");
        setDailyCalorieBurnGoal(profile.dailyCalorieBurnGoal?.toString() || "600");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async (field: string, value: string) => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      const profile = data ? JSON.parse(data) : {};
      
      if (field === "dailyCalorieGoal" || field === "dailyCalorieBurnGoal") {
        profile[field] = parseInt(value) || 0;
      } else {
        profile[field] = value;
      }
      
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      
      if (field === "goalWeight") setGoalWeight(value);
      if (field === "dailyCalorieGoal") setDailyCalorieGoal(value);
      if (field === "dailyCalorieBurnGoal") setDailyCalorieBurnGoal(value);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const openEditModal = (field: string, title: string, currentValue: string) => {
    setEditField(field);
    setEditTitle(title);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSave = () => {
    saveData(editField, editValue);
    setShowEditModal(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6">
          <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Preferences</Text>
        </View>

        {/* Goals Section */}
        <View className="px-5 mb-6">
          <Text className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">Fitness Goals</Text>

          <Pressable
            onPress={() => openEditModal("goalWeight", "Goal Weight", goalWeight)}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="flag-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Goal Weight</Text>
              <Text className="text-white text-base font-semibold">{goalWeight || "Not set"} {goalWeight && "kg"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => openEditModal("dailyCalorieGoal", "Daily Calorie Intake Goal", dailyCalorieGoal)}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="restaurant-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Daily Calorie Intake Goal</Text>
              <Text className="text-white text-base font-semibold">{dailyCalorieGoal} kcal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => openEditModal("dailyCalorieBurnGoal", "Daily Calorie Burn Goal", dailyCalorieBurnGoal)}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="flame-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Daily Calorie Burn Goal</Text>
              <Text className="text-white text-base font-semibold">{dailyCalorieBurnGoal} kcal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
        </View>

        {/* Info Card */}
        <View className="px-5">
          <View className="bg-green-500/10 rounded-2xl p-4 border border-green-500/30">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#22c55e" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className="text-green-500 text-sm font-semibold mb-1">About Your Goals</Text>
                <Text className="text-gray-400 text-sm leading-5">
                  Set realistic goals based on your fitness level. The calorie burn goal affects the progress ring on your home screen.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="fade" transparent onRequestClose={() => setShowEditModal(false)}>
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-[#1a1a1a] rounded-3xl p-6 w-[90%] max-w-md border border-[#2a2a2a]">
            <Text className="text-white text-xl font-bold mb-4">{editTitle}</Text>

            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              className="bg-[#2a2a2a] rounded-xl px-4 py-3 text-white text-base mb-6"
              placeholder={`Enter ${editTitle.toLowerCase()}`}
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-400 font-semibold text-base">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} className="flex-1 bg-green-500 rounded-xl py-3 items-center active:opacity-80">
                <Text className="text-black font-bold text-base">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Preferences;
