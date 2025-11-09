import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-5 bg-black">
        <Text className="text-white text-3xl font-bold">Profile</Text>
        <Text className="text-slate-400 text-base mt-4 text-center">
          View and edit your profile settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
