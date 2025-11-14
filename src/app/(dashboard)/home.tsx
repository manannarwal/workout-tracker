import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        // User pressed OK on Android
        setSelectedDate(date);
      }
      // If user pressed Cancel, event.type === 'dismissed', do nothing
    } else {
      // iOS: just update temp date
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleDatePickerOpen = () => {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    setSelectedDate(tempDate);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <ScrollView 
        className="flex-1 bg-black"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row justify-center align-middle px-5 py-2">
          <Text className="text-white text-2xl font-bold">
            Welcome back, Alex!
          </Text>
        </View>
        <View className="flex-row justify-center align-middle ">
          <Pressable 
            onPress={handleDatePickerOpen}
            className="flex-row items-center justify-center bg-[#1a1a1a] rounded-full px-3 py-2 active:bg-[#2a2a2a]"
          >
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text className="text-[#6b7280] ml-2 text-sm font-medium">{formatDate(selectedDate)}</Text>
          </Pressable>
        </View>

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={handleDateCancel}
          >
            <View className="flex-1 bg-black/70 justify-center items-center">
              <View className="bg-[#1a1a1a] rounded-3xl p-6 w-[90%] max-w-md border border-[#2a2a2a]">
                <Text className="text-white text-xl font-bold mb-4 text-center">
                  Select Date
                </Text>
                
                <View className="items-center justify-center py-4">
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    textColor="#ffffff"
                    themeVariant="dark"
                  />
                </View>

                <View className="flex-row gap-3 mt-6">
                  <Pressable
                    onPress={handleDateCancel}
                    className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-gray-400 font-semibold text-base">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDateConfirm}
                    className="flex-1 bg-green-500 rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-black font-bold text-base">Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <View className="flex-row gap-3 px-5 mt-4">
          <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="restaurant-outline" size={20} color="#22c55e" />
              <Text className="text-gray-400 text-sm font-semibold">
                Consumed
              </Text>
            </View>
            <View className="items-center justify-center py-4">
              <View className="w-24 h-24 rounded-full border-8 border-gray-700 items-center justify-center relative">
                <View
                  className="absolute w-24 h-24 rounded-full border-8 border-green-500"
                  style={{
                    borderLeftColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: [{ rotate: "45deg" }],
                  }}
                />
                <Text className="text-white text-2xl font-bold">1,200</Text>
              <Text className="text-gray-400 text-sm -mt-1">kcal</Text>
              </View>
              <Text className="text-gray-400 text-xs mt-2">Goal: 2,000 kcal</Text>
            </View>
          </View>
          <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="flame-outline" size={20} color="#22c55e" />
              <Text className="text-gray-400 text-sm font-semibold">
                Burned
              </Text>
            </View>
            <View className="items-center justify-center py-4">
              <View className="w-24 h-24 rounded-full border-8 border-gray-700 items-center justify-center relative">
                <View
                  className="absolute w-24 h-24 rounded-full border-8 border-green-500"
                  style={{
                    borderRightColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: [{ rotate: "45deg" }],
                  }}
                />
                <Text className="text-white text-2xl font-bold">520</Text>
              <Text className="text-gray-400 text-sm -mt-1">kcal</Text>
              </View>
              <Text className="text-gray-400 text-xs mt-2">Goal: 600 kcal</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">
              Recent Workouts
            </Text>
            <Pressable>
              <Text className="text-gray-400 text-sm">View All</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="walk" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                Morning Run
              </Text>
              <Text className="text-gray-400 text-sm">3.5 miles</Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-base font-semibold">
                350 kcal
              </Text>
              <Text className="text-gray-400 text-sm">7:15 AM</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="barbell" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                Weight Training
              </Text>
              <Text className="text-gray-400 text-sm">45 min</Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-base font-semibold">
                170 kcal
              </Text>
              <Text className="text-gray-400 text-sm">Yesterday</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">
              Today's Nutrition
            </Text>
            <Pressable>
              <Text className="text-gray-400 text-sm">View All</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="fast-food" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">Lunch</Text>
              <Text className="text-gray-400 text-sm">Chicken Salad</Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-base font-semibold">
                450 kcal
              </Text>
              <Text className="text-gray-400 text-sm">35g Protein</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="cafe" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                Breakfast
              </Text>
              <Text className="text-gray-400 text-sm">Oatmeal & Berries</Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-base font-semibold">
                320 kcal
              </Text>
              <Text className="text-gray-400 text-sm">15g Protein</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
