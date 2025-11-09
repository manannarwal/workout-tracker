import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WorkoutIndex = () => {
  const workoutTypes = [
    { id: 'cardio', label: 'Cardio', icon: 'bicycle', route: '/workout/log-cardio' },
    { id: 'strength', label: 'Strength', icon: 'barbell', route: '/workout/log-strength' },
    { id: 'other', label: 'Other', icon: 'fitness', route: '/workout/log-other' },
  ] as const;

  const todaysWorkouts = [
    {
      id: 1,
      name: 'Morning Run',
      details: '3.5 miles, 30 min',
      calories: 350,
      time: '7:15 AM',
      icon: 'walk',
      iconBg: '#22c55e',
    },
    {
      id: 2,
      name: 'Bench Press',
      details: '3 sets of 8 reps (135 lbs)',
      calories: 120,
      time: '9:00 AM',
      icon: 'barbell',
      iconBg: '#22c55e',
    },
    {
      id: 3,
      name: 'Evening Walk',
      details: '2 miles, 40 min',
      calories: 200,
      time: '6:30 PM',
      icon: 'walk',
      iconBg: '#22c55e',
    },
    {
      id: 4,
      name: 'Squats',
      details: '4 sets of 5 reps (225 lbs)',
      calories: 180,
      time: '9:45 AM',
      icon: 'barbell',
      iconBg: '#22c55e',
    },
    {
      id: 5,
      name: 'Rowing',
      details: '2000 meters, 10 min',
      calories: 150,
      time: '5:00 PM',
      icon: 'boat',
      iconBg: '#22c55e',
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <ScrollView 
        className="flex-1 bg-black"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-5 py-4">
          <Text className="text-white text-2xl font-bold">
            Your Daily Summary, Alex.
          </Text>
        </View>

        {/* Log New Workout Section */}
        <View className="px-5 mt-4">
          <Text className="text-white text-xl font-bold mb-4">
            Log New Workout
          </Text>

          {/* Workout Type Selection - Navigate on press */}
          <View className="flex-row gap-3">
            {workoutTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => router.push(type.route as any)}
                className="flex-1 py-4 rounded-xl border bg-[#1a1a1a] border-[#2a2a2a] items-center active:bg-green-500/20 active:border-green-500"
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color="#6b7280"
                />
                <Text className="mt-2 font-semibold text-gray-400">
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Today's Workouts */}
        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">Today's Workouts</Text>
            <Pressable>
              <Text className="text-gray-400 text-sm">View All</Text>
            </Pressable>
          </View>

          {/* Workout List */}
          {todaysWorkouts.map((workout) => (
            <Pressable
              key={workout.id}
              className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: workout.iconBg + '33' }}
              >
                <Ionicons name={workout.icon as any} size={24} color={workout.iconBg} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {workout.name}
                </Text>
                <Text className="text-gray-400 text-sm">{workout.details}</Text>
              </View>
              <View className="items-end">
                <Text className="text-white text-base font-semibold">
                  {workout.calories} kcal
                </Text>
                <Text className="text-gray-400 text-sm">{workout.time}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutIndex;
