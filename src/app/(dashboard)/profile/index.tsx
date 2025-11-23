import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_KEY = "@user_profile";

const Profile = () => {
  const [userName, setUserName] = useState("User");

  useFocusEffect(
    useCallback(() => {
      loadUserName();
    }, [])
  );

  const loadUserName = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        const profile = JSON.parse(data);
        setUserName(profile.name || "User");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => Alert.alert("Logged out", "You have been logged out") },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                PROFILE_KEY,
                "@app_settings",
                "@completed_workouts",
                "@active_strength_workout",
              ]);
              Alert.alert("Success", "Account deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-white text-3xl font-bold">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="px-5 mb-8">
          <View className="bg-[#1a1a1a] rounded-3xl p-6 items-center border border-[#2a2a2a]">
            <View className="w-24 h-24 rounded-full bg-green-500/20 items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#22c55e" />
            </View>
            <Text className="text-white text-2xl font-bold">{userName}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="px-5 mb-6">
          <Pressable
            onPress={() => router.push("/profile/account-details")}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="person-circle-outline" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">Account Details</Text>
              <Text className="text-gray-400 text-sm">Name, email, and password</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/profile/personal-info")}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="body-outline" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">Personal Information</Text>
              <Text className="text-gray-400 text-sm">Age, height, weight, and BMI</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/profile/preferences")}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="trophy-outline" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">Preferences</Text>
              <Text className="text-gray-400 text-sm">Goals and targets</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/profile/app-settings")}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="settings-outline" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">App Settings</Text>
              <Text className="text-gray-400 text-sm">Theme and notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Account Actions */}
        <View className="px-5 mb-8">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-12 h-12 bg-yellow-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="log-out-outline" size={24} color="#eab308" />
            </View>
            <Text className="text-yellow-500 text-lg font-semibold flex-1">Logout</Text>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 border border-red-500/30 active:opacity-80"
          >
            <View className="w-12 h-12 bg-red-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </View>
            <Text className="text-red-500 text-lg font-semibold flex-1">Delete Account</Text>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
