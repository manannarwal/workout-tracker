import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "../../contexts/OnboardingContext";

const dob = () => {
  const { updateOnboardingData } = useOnboarding();
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [selectedYear, setSelectedYear] = useState(2000);

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const ITEM_HEIGHT = 50;

  // Check if user is at least 16 years old
  const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
  const today = new Date();
  let age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();
  const dayDiff = today.getDate() - selectedDate.getDate();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  const isValidAge = age >= 16;

  const handleScroll = (
    event: any,
    items: any[],
    setter: (value: any) => void
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(items[validIndex]);
  };

  // Scroll to 01 Jan 2000 on mount
  useEffect(() => {
    // Find index of year 2000
    const yearIndex = years.findIndex(year => year === 2000);
    
    // Scroll to correct positions
    setTimeout(() => {
      // Day = 15 (index 14)
      dayScrollRef.current?.scrollTo({ y: 14 * ITEM_HEIGHT, animated: false });
      
      // Month = June (index 5)
      monthScrollRef.current?.scrollTo({ y: 5 * ITEM_HEIGHT, animated: false });
      
      // Year = 2000
      if (yearIndex !== -1) {
        yearScrollRef.current?.scrollTo({ y: yearIndex * ITEM_HEIGHT, animated: false });
      }
    }, 100);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0a3117]">
      <View className="flex-1 justify-between px-5 py-4">
        <View>
          <Text className="text-white text-xl text-center font-semibold">
            Almost There
          </Text>
          <View className="flex-row gap-2 justify-center mt-5 -mx-3">
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-green-500 w-[17%] rounded-xl"></View>
            <View className="border-b-4 border-white w-[17%] rounded-xl"></View>
          </View>
          <View className="mt-8">
            <Text className="text-5xl sm:text-6xl text-white font-bold leading-tight">
              What's your date of birth?
            </Text>
            <Text className="text-slate-400 mt-2 text-base">
              This helps us calculate your fitness metrics accurately.
            </Text>
          </View>

          {/* Date Picker Wheels */}
          <View className="mt-8">
            <Text className="text-white font-semibold mb-4">
              Date of Birth
            </Text>
            
            <View className="relative h-[150px] bg-[#122b13] rounded-xl border border-green-700 overflow-hidden">
              <View className="absolute left-0 right-0 h-[50px] border-y-2 border-green-500/30 bg-white/30" 
                style={{ top: 50 }} 
              />

              <View className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#122b13] to-transparent pointer-events-none z-10" />
              <View className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-[#122b13] to-transparent pointer-events-none z-10" />

              <View className="flex-row h-full">
                {/* Day Picker */}
                <ScrollView
                  ref={dayScrollRef}
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onScroll={(e) => handleScroll(e, days, setSelectedDay)}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingVertical: 50 }}
                >
                  {days.map((day) => (
                    <View key={day} className="h-[50px] items-center justify-center">
                      <Text 
                        className={`text-2xl font-semibold ${
                          day === selectedDay ? 'text-white' : 'text-green-500'
                        }`}
                      >
                        {day.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Month Picker */}
                <ScrollView
                  ref={monthScrollRef}
                  className="flex-[2]"
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onScroll={(e) => handleScroll(e, Array.from({ length: 12 }, (_, i) => i), setSelectedMonth)}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingVertical: 50 }}
                >
                  {months.map((month, index) => (
                    <View key={month} className="h-[50px] items-center justify-center">
                      <Text 
                        className={`text-2xl font-semibold ${
                          index === selectedMonth ? 'text-white' : 'text-green-500'
                        }`}
                      >
                        {month}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Year Picker */}
                <ScrollView
                  ref={yearScrollRef}
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onScroll={(e) => handleScroll(e, years, setSelectedYear)}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingVertical: 50 }}
                >
                  {years.map((year) => (
                    <View key={year} className="h-[50px] items-center justify-center">
                      <Text 
                        className={`text-2xl font-semibold ${
                          year === selectedYear ? 'text-white' : 'text-green-500'
                        }`}
                      >
                        {year}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            {!isValidAge && (
              <Text className="text-red-400 mt-2 text-sm">
                You must be at least 16 years old to create an account.
              </Text>
            )}
          </View>
        </View>

        <View className="items-center">
          <Pressable
            className={`rounded-full py-4 w-full max-w-md items-center ${
              isValidAge
                ? 'bg-green-500 active:opacity-80' 
                : 'bg-gray-600 opacity-50'
            }`}
            onPress={() => {
              if (isValidAge) {
                const dob = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                updateOnboardingData({ dateOfBirth: dob });
                router.push("/(onboarding)/gender");
              }
            }}
            disabled={!isValidAge}
          >
            <Text className="text-black font-semibold text-xl">
              Next
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default dob;
