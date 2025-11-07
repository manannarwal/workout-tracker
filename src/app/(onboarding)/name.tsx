import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";


const name = () => {
  const [userName, setUserName] = useState('');
  return (
    <View>
      <View className="h-full w-full bg-[#0a3117]">
        <SafeAreaView>
          <Text className="text-white text-2xl text-center font-semibold mt-2">
            Create your Account
          </Text>
          <View className="flex-row gap-2 justify-center">
            <View className="border-b-4 border-green-500 mt-5 w-[22%]"></View>
            <View className="border-b-4 border-white mt-5 w-[22%]"></View>
            <View className="border-b-4 border-white mt-5 w-[22%]"></View>
            <View className="border-b-4 border-white mt-5 w-[22%]"></View>
          </View>
          <View className="mt-10">
            <Text className="text-5xl text-white ml-5 mr-5 font-bold">What should we call you?</Text>
            <Text className="text-slate-400 ml-5 mr-5 mt-2">Let's get started with your name.</Text>
          </View>
          <View>
            <Text className="text-white mt-5 ml-5 mb-2 font-semibold">Name</Text>
            <TextInput
            className="border border-green-700 rounded-lg px-4 py-6 text-white mx-5 bg-[#122b13] mt-2"
            placeholder="John Doe"
              value={userName}
              onChangeText={setUserName}
              returnKeyType="done"
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default name;
