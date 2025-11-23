import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_KEY = "@user_profile";

const AccountDetails = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<"name" | "email" | "password">("name");
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
        setName(profile.name || "");
        setEmail(profile.email || "");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async (field: string, value: string) => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      const profile = data ? JSON.parse(data) : {};
      profile[field] = value;
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      
      if (field === "name") setName(value);
      if (field === "email") setEmail(value);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const openEditModal = (field: "name" | "email" | "password", title: string, currentValue: string) => {
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
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6">
          <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Account Details</Text>
        </View>

        {/* Account Fields */}
        <View className="px-5">
          <Pressable
            onPress={() => openEditModal("name", "Name", name)}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="person-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Name</Text>
              <Text className="text-white text-base font-semibold">{name || "Not set"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => openEditModal("email", "Email", email)}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="mail-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Email</Text>
              <Text className="text-white text-base font-semibold">{email || "Not set"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => openEditModal("password", "Password", "")}
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="lock-closed-outline" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Password</Text>
              <Text className="text-white text-base font-semibold">••••••••</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
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
              keyboardType={editField === "email" ? "email-address" : "default"}
              secureTextEntry={editField === "password"}
              autoCapitalize={editField === "email" ? "none" : "words"}
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

export default AccountDetails;
