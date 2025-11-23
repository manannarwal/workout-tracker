import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SETTINGS_KEY = "@app_settings";

const AppSettings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        const settings = JSON.parse(data);
        setDarkMode(settings.darkMode ?? true);
        setNotifications(settings.notifications ?? true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = data ? JSON.parse(data) : {};
      settings[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    saveSetting("darkMode", value);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    saveSetting("notifications", value);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6">
          <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">App Settings</Text>
        </View>

        {/* Settings */}
        <View className="px-5">
          <Text className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">Appearance</Text>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-6 justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="moon-outline" size={20} color="#22c55e" />
              </View>
              <View>
                <Text className="text-white text-base font-semibold">Dark Mode</Text>
                <Text className="text-gray-400 text-sm">Always enabled for better viewing</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#4b5563", true: "#22c55e" }}
              thumbColor="#ffffff"
            />
          </View>

          <Text className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">Notifications</Text>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="notifications-outline" size={20} color="#22c55e" />
              </View>
              <View>
                <Text className="text-white text-base font-semibold">Push Notifications</Text>
                <Text className="text-gray-400 text-sm">Workout reminders and updates</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#4b5563", true: "#22c55e" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Info Section */}
        <View className="px-5 mt-8">
          <View className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
            <Text className="text-gray-400 text-sm font-semibold mb-2">About</Text>
            <Text className="text-gray-500 text-sm">Workout Tracker v1.0.0</Text>
            <Text className="text-gray-500 text-sm mt-1">Built with Expo & React Native</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppSettings;
