import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  activityName: string;
  distance: string;
  duration: string;
  calories: string;
  timestamp: string;
}

type Workout = StrengthWorkout | CardioWorkout;

const COMPLETED_WORKOUTS_KEY = "@completed_workouts";

const WorkoutIndex = () => {
  const [todaysWorkouts, setTodaysWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(
    new Set()
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Reload workouts when screen comes into focus or date changes
  useFocusEffect(
    useCallback(() => {
      loadWorkoutsForDate(selectedDate);
    }, [selectedDate])
  );

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getWorkoutIcon = (workout: Workout): keyof typeof Ionicons.glyphMap => {
    if (workout.type === "strength") return "barbell";
    return "bicycle";
  };

  const getWorkoutName = (workout: Workout) => {
    return workout.type === "strength" ? workout.title : workout.activityName;
  };

  const getWorkoutDetails = (workout: Workout) => {
    if (workout.type === "strength") {
      const totalSets = workout.exercises.reduce(
        (sum, ex) => sum + ex.sets.length,
        0
      );
      return `${workout.exercises.length} exercises, ${totalSets} sets`;
    } else {
      return `${workout.distance} km, ${workout.duration} min`;
    }
  };

  const getWorkoutCalories = (workout: Workout) => {
    if (workout.type === "cardio") {
      return parseInt(workout.calories) || 0;
    }
    // Use saved totalCalories from strength workout
    if (workout.totalCalories) {
      return workout.totalCalories;
    }
    // Fallback: calculate from sets if not saved
    return workout.exercises.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce((calSum, set) => calSum + (set.calories || 0), 0),
      0
    );
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedWorkouts(new Set());
  };

  const toggleWorkoutSelection = (workoutId: string) => {
    const newSelected = new Set(selectedWorkouts);
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId);
    } else {
      newSelected.add(workoutId);
    }
    setSelectedWorkouts(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedWorkouts.size === 0) return;

    try {
      const workoutsData = await AsyncStorage.getItem(COMPLETED_WORKOUTS_KEY);
      if (workoutsData) {
        const allWorkouts: Workout[] = JSON.parse(workoutsData);
        const filteredWorkouts = allWorkouts.filter(
          (w) => !selectedWorkouts.has(w.id)
        );
        await AsyncStorage.setItem(
          COMPLETED_WORKOUTS_KEY,
          JSON.stringify(filteredWorkouts)
        );

        // Reload the workouts
        await loadWorkoutsForDate(selectedDate);
        setIsEditMode(false);
        setSelectedWorkouts(new Set());
      }
    } catch (error) {
      console.error("Error deleting workouts:", error);
    }
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

  const workoutTypes = [
    {
      id: "walk",
      label: "Walk",
      icon: "walk",
      iconLibrary: "ionicons",
      route: "/workout/log-cardio",
    },
    {
      id: "run",
      label: "Run",
      icon: "run-fast",
      iconLibrary: "material",
      route: "/workout/log-cardio",
    },
    {
      id: "ride",
      label: "Ride",
      icon: "bicycle",
      iconLibrary: "ionicons",
      route: "/workout/log-cardio",
    },
    {
      id: "strength",
      label: "Weight Training",
      icon: "barbell",
      iconLibrary: "ionicons",
      route: "/workout/log-strength",
    },
    {
      id: "sports",
      label: "Sports",
      icon: "american-football",
      iconLibrary: "ionicons",
      route: "/workout/log-other",
    },
    {
      id: "other",
      label: "Others",
      icon: "fitness",
      iconLibrary: "ionicons",
      route: "/workout/log-other",
    },
  ] as const;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <ScrollView
        className="flex-1 bg-black"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text className="text-white text-2xl font-bold">
            Your Daily Summary
          </Text>
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

        <View className="px-5 mt-4">
          <Text className="text-white text-xl font-bold mb-4">
            Log New Workout
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {workoutTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => router.push(type.route as any)}
                className="w-[31%] py-4 rounded-xl border bg-[#1a1a1a] border-[#2a2a2a] items-center active:bg-green-500/20 active:border-green-500"
              >
                {type.iconLibrary === "material" ? (
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={24}
                    color="#2ffe4b"
                  />
                ) : (
                  <Ionicons name={type.icon as any} size={24} color="#2ffe4b" />
                )}
                <Text className="mt-2 font-semibold text-gray-400 text-md text-center">
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">Your Activity</Text>
            {todaysWorkouts.length > 0 && (
              <Pressable onPress={toggleEditMode}>
                <Text
                  className={`text-sm font-semibold bg-[#313131] px-3 py-1 rounded-full ${isEditMode ? "text-green-500" : "text-gray-400"}`}
                >
                  {isEditMode ? "Done" : "Edit"}
                </Text>
              </Pressable>
            )}
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
                No Workouts Today
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Start logging your workouts to see them here
              </Text>
            </View>
          )}

          {!loading &&
            todaysWorkouts.map((workout) => (
              <Pressable
                key={workout.id}
                onPress={() => {
                  if (isEditMode) {
                    toggleWorkoutSelection(workout.id);
                  } else {
                    router.push(`/workout/detail?id=${workout.id}`);
                  }
                }}
                className={`flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80 ${
                  selectedWorkouts.has(workout.id)
                    ? "border-2 border-green-500"
                    : ""
                }`}
              >
                {isEditMode && (
                  <View className="mr-3">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedWorkouts.has(workout.id)
                          ? "bg-green-500 border-green-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedWorkouts.has(workout.id) && (
                        <Ionicons name="checkmark" size={16} color="black" />
                      )}
                    </View>
                  </View>
                )}

                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: "#22c55e33" }}
                >
                  <Ionicons
                    name={getWorkoutIcon(workout)}
                    size={24}
                    color="#22c55e"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold">
                    {getWorkoutName(workout)}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {getWorkoutDetails(workout)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-white text-base font-semibold">
                    {getWorkoutCalories(workout)} kcal
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {formatTime(workout.timestamp)}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>

        {isEditMode && selectedWorkouts.size > 0 && (
          <View className="px-5 pb-6 pt-4">
            <Pressable
              onPress={handleDeleteSelected}
              className="bg-red-500 rounded-xl py-4 items-center active:opacity-80 flex-row justify-center"
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Delete {selectedWorkouts.size} Workout
                {selectedWorkouts.size > 1 ? "s" : ""}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutIndex;
