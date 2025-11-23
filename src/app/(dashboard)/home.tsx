import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  calories?: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

interface StrengthWorkout {
  id: string;
  type: "strength";
  title: string;
  duration: number;
  exercises: Exercise[];
  totalCalories?: number;
  timestamp: string;
}

interface CardioWorkout {
  id: string;
  type: "cardio";
  workoutType?: "walk" | "run" | "ride" | "other";
  activityName: string;
  distance: string;
  duration: string;
  calories: string;
  timestamp: string;
}

type Workout = StrengthWorkout | CardioWorkout;

const COMPLETED_WORKOUTS_KEY = "@completed_workouts";
const PROFILE_KEY = "@user_profile";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [todaysWorkouts, setTodaysWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(600); // User's daily calorie burn goal

  // Load workouts when screen comes into focus or date changes
  useFocusEffect(
    useCallback(() => {
      loadWorkoutsForDate(selectedDate);
      loadUserGoal();
    }, [selectedDate])
  );

  const loadUserGoal = async () => {
    try {
      const profileData = await AsyncStorage.getItem(PROFILE_KEY);
      if (profileData) {
        const profile = JSON.parse(profileData);
        setDailyCalorieGoal(profile.dailyCalorieBurnGoal || 600);
      }
    } catch (error) {
      console.error("Error loading user goal:", error);
    }
  };

  const loadWorkoutsForDate = async (date: Date) => {
    try {
      const workoutsData = await AsyncStorage.getItem(COMPLETED_WORKOUTS_KEY);
      if (workoutsData) {
        const allWorkouts: Workout[] = JSON.parse(workoutsData);

        // Filter for selected date's workouts
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const dateWorkouts = allWorkouts.filter((workout) => {
          const workoutDate = new Date(workout.timestamp);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === targetDate.getTime();
        });

        setTodaysWorkouts(dateWorkouts);
      } else {
        setTodaysWorkouts([]);
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCaloriesBurned = () => {
    return todaysWorkouts.reduce((total, workout) => {
      if (workout.type === "cardio") {
        return total + (parseInt(workout.calories) || 0);
      } else {
        return total + (workout.totalCalories || 0);
      }
    }, 0);
  };

  const getCalorieProgress = () => {
    const burned = getTotalCaloriesBurned();
    if (dailyCalorieGoal === 0) return 0;
    return Math.min((burned / dailyCalorieGoal) * 100, 100);
  };

  const getExcessCalorieProgress = () => {
    const burned = getTotalCaloriesBurned();
    if (burned <= dailyCalorieGoal) return 0;
    const excess = burned - dailyCalorieGoal;
    // Show excess as additional progress, capping at another 100%
    return Math.min((excess / dailyCalorieGoal) * 100, 100);
  };

  const getWorkoutIcon = (workout: Workout): { name: string; library: 'ionicons' | 'material' } => {
    if (workout.type === "strength") return { name: "barbell", library: "ionicons" };
    
    if (workout.workoutType === "walk") return { name: "walk", library: "ionicons" };
    if (workout.workoutType === "run") return { name: "run-fast", library: "material" };
    if (workout.workoutType === "ride") return { name: "bicycle", library: "ionicons" };
    
    const activityName = workout.activityName.toLowerCase();
    if (activityName.includes("walk")) return { name: "walk", library: "ionicons" };
    if (activityName.includes("run") || activityName.includes("jog")) return { name: "run-fast", library: "material" };
    if (activityName.includes("ride") || activityName.includes("cycl") || activityName.includes("bike")) return { name: "bicycle", library: "ionicons" };
    
    return { name: "help-circle-outline", library: "ionicons" };
  };

  const getWorkoutName = (workout: Workout) => {
    return workout.type === "strength" ? workout.title : workout.activityName;
  };

  const getWorkoutDetails = (workout: Workout) => {
    if (workout.type === "strength") {
      const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      return `${workout.exercises.length} exercises, ${totalSets} sets`;
    } else {
      return `${workout.distance} km, ${workout.duration} min`;
    }
  };

  const getWorkoutCalories = (workout: Workout) => {
    if (workout.type === "cardio") {
      return parseInt(workout.calories) || 0;
    }
    if (workout.totalCalories) {
      return workout.totalCalories;
    }
    return workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((calSum, set) => calSum + (set.calories || 0), 0), 0
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
              <View className="w-24 h-24 items-center justify-center relative">
                <Svg width="96" height="96" style={{ position: 'absolute' }}>
                  {/* Background circle */}
                  <Circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Green progress circle (up to 100% of goal) */}
                  {getCalorieProgress() > 0 && (
                    <>
                      {/* Black border for depth effect */}
                      <Circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#000000"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - getCalorieProgress() / 100)}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="48, 48"
                      />
                      {/* Green progress */}
                      <Circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#22c55e"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - getCalorieProgress() / 100)}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="48, 48"
                      />
                    </>
                  )}
                  {/* Orange excess circle (beyond 100% of goal) */}
                  {getExcessCalorieProgress() > 0 && (
                    <>
                      {/* Black border for depth effect */}
                      <Circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#000000"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - getExcessCalorieProgress() / 100)}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="48, 48"
                      />
                      {/* Orange progress */}
                      <Circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#f97316"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - getExcessCalorieProgress() / 100)}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="48, 48"
                      />
                    </>
                  )}
                </Svg>
                <View className="items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{getTotalCaloriesBurned()}</Text>
                  <Text className="text-gray-400 text-sm -mt-1">kcal</Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xs mt-2">Goal: {dailyCalorieGoal} kcal</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">
              Recent Workouts
            </Text>
            <Pressable onPress={() => router.push('/workout')}>
              <Text className="text-gray-400 text-sm bg-[#313131] px-3 py-1 rounded-xl">View All</Text>
            </Pressable>
          </View>

          {loading && (
            <View className="items-center py-10">
              <Text className="text-gray-400">Loading workouts...</Text>
            </View>
          )}

          {!loading && todaysWorkouts.length === 0 && (
            <View className="bg-[#1a1a1a] rounded-2xl p-8 items-center border border-[#2a2a2a]">
              <Ionicons name="calendar-outline" size={48} color="#6b7280" />
              <Text className="text-white text-lg font-semibold mt-4">
                No Workouts Yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Start logging your workouts to see them here
              </Text>
            </View>
          )}

          {!loading && todaysWorkouts.slice(0, 3).map((workout) => (
            <Pressable
              key={workout.id}
              onPress={() => router.push(`/workout/detail?id=${workout.id}`)}
              className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
            >
              <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
                {(() => {
                  const icon = getWorkoutIcon(workout);
                  return icon.library === "material" ? (
                    <MaterialCommunityIcons
                      name={icon.name as any}
                      size={24}
                      color="#22c55e"
                    />
                  ) : (
                    <Ionicons
                      name={icon.name as any}
                      size={24}
                      color="#22c55e"
                    />
                  );
                })()}
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {getWorkoutName(workout)}
                </Text>
                <Text className="text-gray-400 text-sm">{getWorkoutDetails(workout)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-white text-base font-semibold">
                  {getWorkoutCalories(workout)} kcal
                </Text>
                <Text className="text-gray-400 text-sm">{formatTime(workout.timestamp)}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="px-5 mt-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">
              Today's Nutrition
            </Text>
            <Pressable>
              <Text className="text-gray-400 text-sm bg-[#313131] px-3 py-1 rounded-xl">View All</Text>
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
