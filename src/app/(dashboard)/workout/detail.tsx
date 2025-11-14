import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
  type: 'strength';
  title: string;
  duration: number;
  exercises: Exercise[];
  totalCalories?: number;
  timestamp: string;
}

interface CardioWorkout {
  id: string;
  type: 'cardio';
  activityName: string;
  distance: string;
  duration: string;
  calories: string;
  timestamp: string;
}

type Workout = StrengthWorkout | CardioWorkout;

const COMPLETED_WORKOUTS_KEY = '@completed_workouts';

const WorkoutDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetail();
  }, [id]);

  const loadWorkoutDetail = async () => {
    try {
      const workoutsData = await AsyncStorage.getItem(COMPLETED_WORKOUTS_KEY);
      if (workoutsData) {
        const workouts: Workout[] = JSON.parse(workoutsData);
        const foundWorkout = workouts.find(w => w.id === id);
        setWorkout(foundWorkout || null);
      }
    } catch (error) {
      console.error('Error loading workout detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-white text-xl font-bold mt-4">Workout Not Found</Text>
          <Pressable 
            onPress={() => router.back()}
            className="bg-green-500 rounded-xl py-3 px-8 mt-6 active:opacity-80"
          >
            <Text className="text-black font-bold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-[#1a1a1a]">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Workout Summary</Text>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Workout Header Info */}
          <View className="px-5 pt-6 pb-4">
            <View className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
              <View className="flex-row items-center mb-4">
                <View className="w-14 h-14 bg-green-500/20 rounded-full items-center justify-center mr-4">
                  <Ionicons 
                    name={workout.type === 'strength' ? 'barbell' : 'bicycle'} 
                    size={28} 
                    color="#22c55e" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold">
                    {workout.type === 'strength' ? workout.title : workout.activityName}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1 capitalize">
                    {workout.type} Workout
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center pt-4 border-t border-[#2a2a2a]">
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text className="text-gray-400 text-sm ml-2">
                  {formatDate(workout.timestamp)}
                </Text>
              </View>
            </View>
          </View>

          {/* Workout Type Specific Details */}
          {workout.type === 'strength' ? (
            <StrengthWorkoutDetails workout={workout} formatTime={formatTime} />
          ) : (
            <CardioWorkoutDetails workout={workout} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Strength Workout Details Component
const StrengthWorkoutDetails = ({ 
  workout, 
  formatTime 
}: { 
  workout: StrengthWorkout; 
  formatTime: (seconds: number) => string;
}) => {
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalReps = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((repsSum, set) => repsSum + (parseInt(set.reps) || 0), 0), 0
  );
  const totalWeight = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((weightSum, set) => weightSum + (parseFloat(set.weight) || 0), 0), 0
  );
  const totalCaloriesFromSets = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((calSum, set) => calSum + (set.calories || 0), 0), 0
  );

  return (
    <View className="px-5">
      {/* Summary Stats */}
      <View className="bg-[#1a1a1a] rounded-2xl p-5 mb-4 border border-[#2a2a2a]">
        <Text className="text-white text-lg font-bold mb-4">Summary</Text>
        <View className="flex-row flex-wrap gap-4">
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Duration</Text>
            <Text className="text-white text-xl font-bold mt-1">{formatTime(workout.duration)}</Text>
          </View>
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Calories Burned (Approx)</Text>
            <Text className="text-white text-xl font-bold mt-1">{Math.round(totalCaloriesFromSets)} kcal</Text>
          </View>
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Exercises</Text>
            <Text className="text-white text-xl font-bold mt-1">{workout.exercises.length}</Text>
          </View>
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Total Sets</Text>
            <Text className="text-white text-xl font-bold mt-1">{totalSets}</Text>
          </View>
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Total Reps</Text>
            <Text className="text-white text-xl font-bold mt-1">{totalReps}</Text>
          </View>
          <View className="flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-sm">Total Volume</Text>
            <Text className="text-white text-xl font-bold mt-1">{totalWeight.toFixed(1)} kg</Text>
          </View>
        </View>
      </View>

      {/* Exercises */}
      <Text className="text-white text-lg font-bold mb-3">Exercises</Text>
      {workout.exercises.map((exercise, index) => (
        <View key={exercise.id} className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-[#2a2a2a] ">
          <Text className="text-white text-base font-bold mb-3">{exercise.name}</Text>
          
          {/* Sets Header */}
          {exercise.sets.length > 0 && (
            <View className="flex-row mb-2 px-2">
              <Text className="text-gray-500 text-xs font-semibold w-10 text-center">SET</Text>
              <Text className="text-gray-500 text-xs font-semibold flex-1 text-center">WEIGHT</Text>
              <Text className="text-gray-500 text-xs font-semibold flex-1 text-center">REPS</Text>
              <Text className="text-gray-500 text-xs font-semibold flex-1 text-center">KCAL</Text>
            </View>
          )}

          {/* Sets List */}
          {exercise.sets.map((set, setIndex) => (
            <View key={set.id} className="flex-row items-center mb-2">
              <View className="w-10 items-center">
                <Text className="text-green-500 font-bold text-base">{setIndex + 1}</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white font-semibold">{set.weight || '0'} kg</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white font-semibold">{set.reps || '0'}</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-green-500 font-semibold">{set.calories ? set.calories.toFixed(1) : '0'}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Cardio Workout Details Component
const CardioWorkoutDetails = ({ workout }: { workout: CardioWorkout }) => {
  return (
    <View className="px-5">
      {/* Cardio Stats */}
      <View className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
        <Text className="text-white text-lg font-bold mb-4">Workout Details</Text>
        <View className="gap-4">
          <View className="flex-row items-center justify-between py-3 border-b border-[#2a2a2a]">
            <View className="flex-row items-center">
              <Ionicons name="navigate" size={20} color="#22c55e" />
              <Text className="text-gray-400 ml-3">Distance</Text>
            </View>
            <Text className="text-white text-lg font-bold">{workout.distance} miles</Text>
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-[#2a2a2a]">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#22c55e" />
              <Text className="text-gray-400 ml-3">Duration</Text>
            </View>
            <Text className="text-white text-lg font-bold">{workout.duration} min</Text>
          </View>
          
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="flame" size={20} color="#22c55e" />
              <Text className="text-gray-400 ml-3">Calories Burned</Text>
            </View>
            <Text className="text-white text-lg font-bold">{workout.calories} kcal</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WorkoutDetail;
