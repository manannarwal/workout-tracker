import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import Svg, { Path } from 'react-native-svg';

const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <Path fill="none" d="M0 0h48v48H0z"/>
  </Svg>
);

const getstarted = () => {
  return (
    <View className="flex-1 bg-[#0a3117]">
      <View className="h-full w-full">
        <Image
          source={require("../../../assets/images/Onboarding/getStartedImage.png")}
          className="h-60 w-full opacity-60 object-contain"
        />
        <View className="absolute top-0 left-0 right-0 h-60 items-center justify-center">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="dumbbell"
              size={28}
              color="lightgreen"
            />
            <Text className="text-3xl text-white font-semibold font-roboto">
              FitTrack
            </Text>
          </View>
        </View>
      </View>
      <View className="absolute top-60 w-full items-center px-4">
        <Text className="text-white dark:text-white tracking-tight text-[44px] font-bold leading-[1.1] text-center mt-14 uppercase">
          Unleash Your Ultimate Potential
        </Text>
        <Text className="text-slate-400 dark:text-slate-300 text-base font-normal leading-normal px-4 text-center max-w-md mt-8">
          Track every metric, analyze your performance, and visualize your
          progress with precision-driven insights. Elevate your training.
        </Text>

        <View>
          <Pressable className="mt-8 bg-green-500 rounded-full px-[30%] py-[4%] active:opacity-80" onPress={() => router.push('/name')}>
            <Text className="text-black font-semibold text-xl ">
              Get Started
            </Text>
          </Pressable>
        </View>

        <View className="flex items-center w-full">
          <Text className="mt-4 text-md text-slate-300">or</Text>
        </View>

        <View>
          <Pressable className="mt-4 bg-green-500 rounded-full px-[16%] py-[4%] active:opacity-80">
            <View className="flex-row items-center gap-2">
              <GoogleIcon size={24} />
              <Text className="text-black font-semibold text-xl">
                Continue with Google
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="mt-6">
          <Pressable onPress={() => router.push('/(onboarding)/login')}>
            <Text className="text-green-400 text-base text-center">
              Already have an account? <Text className="font-semibold">Login</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default getstarted;