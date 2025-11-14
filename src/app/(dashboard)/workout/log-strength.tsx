import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXERCISES_DATABASE } from "../../../constants/exercises";

// TypeScript interfaces
interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

interface ActiveWorkoutData {
  workoutTitle: string;
  startTime: number; // Unix timestamp when workout started
  exercises: Exercise[];
  isActive: boolean;
}

const ACTIVE_WORKOUT_KEY = '@active_strength_workout';

const LogStrength = () => {
  const [isLoggingStarted, setIsLoggingStarted] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutData | null>(null);

  // Check for active workout on mount
  useEffect(() => {
    checkActiveWorkout();
  }, []);

  const checkActiveWorkout = async () => {
    try {
      const workoutData = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (workoutData) {
        const workout: ActiveWorkoutData = JSON.parse(workoutData);
        if (workout.isActive) {
          setActiveWorkout(workout);
        }
      }
    } catch (error) {
      console.error('Error loading active workout:', error);
    }
  };

  const handleStartLogging = async () => {
    const startTime = Date.now();
    const newWorkout: ActiveWorkoutData = {
      workoutTitle: "",
      startTime,
      exercises: [],
      isActive: true,
    };
    
    try {
      await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(newWorkout));
      setActiveWorkout(newWorkout);
      setIsLoggingStarted(true);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleResumeLogging = () => {
    setIsLoggingStarted(true);
  };

  const formatDuration = (startTime: number) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoggingStarted) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-black">
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="flex-row items-center px-5 py-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-2xl font-bold">Log Strength Workout</Text>
          </View>

          <ScrollView 
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center py-10">
              <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="barbell" size={48} color="#22c55e" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">Ready to Workout?</Text>
              <Text className="text-gray-400 text-center px-8 mb-8">
                Track your exercises, sets, reps, and weights all in one place
              </Text>

              {/* Info Cards */}
              <View className="w-full gap-3 mb-8">
                <View className="flex-row items-center bg-[#1a1a1a] rounded-xl p-4">
                  <Ionicons name="timer-outline" size={24} color="#22c55e" />
                  <Text className="text-gray-300 ml-3 flex-1">Workout timer starts automatically</Text>
                </View>
                <View className="flex-row items-center bg-[#1a1a1a] rounded-xl p-4">
                  <Ionicons name="add-circle-outline" size={24} color="#22c55e" />
                  <Text className="text-gray-300 ml-3 flex-1">Add multiple exercises and sets</Text>
                </View>
                <View className="flex-row items-center bg-[#1a1a1a] rounded-xl p-4">
                  <Ionicons name="analytics-outline" size={24} color="#22c55e" />
                  <Text className="text-gray-300 ml-3 flex-1">Track weight and reps for each set</Text>
                </View>
              </View>

              <Pressable
                onPress={handleStartLogging}
                disabled={!!activeWorkout}
                className={`rounded-xl py-4 px-12 ${
                  activeWorkout 
                    ? 'bg-gray-600 opacity-50' 
                    : 'bg-green-500 active:opacity-80'
                }`}
              >
                <Text className="text-black font-bold text-lg">Start Logging</Text>
              </Pressable>

              {/* Active Workout View Button */}
              {activeWorkout && (
                <View className="mt-6 w-full">
                  <View className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="fitness" size={20} color="#22c55e" />
                      <Text className="text-green-500 font-bold ml-2">Active Workout in Progress</Text>
                    </View>
                    <Text className="text-gray-300 text-sm">
                      {activeWorkout.workoutTitle || "Untitled Workout"}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      Duration: {formatDuration(activeWorkout.startTime)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleResumeLogging}
                    className="bg-green-500 rounded-xl py-3 px-8 active:opacity-80 items-center"
                  >
                    <Text className="text-black font-bold">View Active Workout</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Show the actual logging interface
  return <StrengthLoggingScreen activeWorkoutData={activeWorkout} />;
};

// Strength Logging Screen Component
const StrengthLoggingScreen = ({ activeWorkoutData }: { activeWorkoutData: ActiveWorkoutData | null }) => {
  const [workoutTitle, setWorkoutTitle] = useState(activeWorkoutData?.workoutTitle || "");
  const [startTime] = useState(activeWorkoutData?.startTime || Date.now());
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>(activeWorkoutData?.exercises || []);

  // Calculate elapsed time from start time - always runs
  useEffect(() => {
    const calculateElapsed = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsed);
    };
    
    calculateElapsed(); // Initial calculation
    
    // Timer always runs regardless of isTimerRunning state
    const interval = setInterval(calculateElapsed, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Recalculate timer when app comes to foreground
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimer(elapsed);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startTime]);

  // Save workout state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveWorkoutState = async () => {
      const workoutData: ActiveWorkoutData = {
        workoutTitle,
        startTime,
        exercises,
        isActive: true,
      };
      
      try {
        await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workoutData));
      } catch (error) {
        console.error('Error saving workout state:', error);
      }
    };

    saveWorkoutState();
  }, [workoutTitle, exercises, startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: [],
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSet: WorkoutSet = {
          id: Date.now().toString(),
          weight: "",
          reps: "",
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => 
            s.id === setId ? { ...s, [field]: value } : s
          ),
        };
      }
      return ex;
    }));
  };

  const handleSaveWorkout = async () => {
    const workoutData = {
      title: workoutTitle,
      duration: timer,
      exercises: exercises,
      timestamp: new Date().toISOString(),
    };
    console.log("Saving workout:", workoutData);
    
    // Clear active workout from storage
    try {
      await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (error) {
      console.error('Error clearing active workout:', error);
    }
    
    // TODO: Save to database/state
    router.back();
  };

  const isValidWorkout = workoutTitle.trim().length > 0 && exercises.length > 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      <View className="flex-1 bg-black">
        {/* Header with Timer */}
        <View className="px-5 py-4 border-b border-[#1a1a1a]">
          <View className="flex-row items-center justify-between mb-3">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <View className="flex-row items-center">
              <Ionicons name="timer" size={20} color="#22c55e" />
              <Text className="text-green-500 text-lg font-bold ml-2">{formatTime(timer)}</Text>
            </View>
            <Pressable onPress={() => setIsTimerRunning(!isTimerRunning)}>
              <Ionicons name={isTimerRunning ? "pause" : "play"} size={24} color="#22c55e" />
            </Pressable>
          </View>

          {/* Workout Title Input */}
          <TextInput
            className="bg-[#1a1a1a] rounded-xl px-4 py-3 text-white text-lg font-semibold border border-[#2a2a2a]"
            placeholder="Workout Title"
            placeholderTextColor="#6b7280"
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
          />
        </View>

        <ScrollView 
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Exercises List */}
          {exercises.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              onUpdateName={(name) => updateExerciseName(exercise.id, name)}
              onRemove={() => removeExercise(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
            />
          ))}

          {/* Add Exercise Button */}
          <Pressable
            onPress={addExercise}
            className="bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-xl py-4 mt-4 items-center active:bg-[#2a2a2a]"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={24} color="#22c55e" />
              <Text className="text-green-500 font-semibold ml-2">Add Exercise</Text>
            </View>
          </Pressable>

          <View className="h-6" />
        </ScrollView>

        {/* Save Button */}
        <View className="px-5 pb-6 pt-4 border-t border-[#1a1a1a]">
          <Pressable
            onPress={handleSaveWorkout}
            disabled={!isValidWorkout}
            className={`rounded-xl py-4 items-center ${
              isValidWorkout 
                ? 'bg-green-500 active:opacity-80' 
                : 'bg-gray-600 opacity-50'
            }`}
          >
            <Text className="text-black font-bold text-lg">Complete Workout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Exercise Card Component
const ExerciseCard = ({
  exercise,
  exerciseIndex,
  onUpdateName,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: {
  exercise: Exercise;
  exerciseIndex: number;
  onUpdateName: (name: string) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState<string[]>(EXERCISES_DATABASE);

  const handleExerciseNameChange = (text: string) => {
    onUpdateName(text);
    
    // Filter exercises based on input
    if (text.trim().length > 0) {
      const filtered = EXERCISES_DATABASE.filter(ex => 
        ex.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredExercises(filtered);
      setShowDropdown(true);
    } else {
      setFilteredExercises(EXERCISES_DATABASE);
      setShowDropdown(true);
    }
  };

  const selectExercise = (exerciseName: string) => {
    onUpdateName(exerciseName);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  return (
    <View className="bg-[#1a1a1a] rounded-xl p-4 mt-4 border border-[#2a2a2a]">
      {/* Exercise Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-400 font-semibold">Exercise {exerciseIndex + 1}</Text>
        <Pressable onPress={onRemove}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>

      {/* Exercise Name with Dropdown */}
      <View className="mb-4">
        <TextInput
          className="bg-black rounded-lg px-4 py-3 text-white font-semibold border border-[#2a2a2a]"
          placeholder="Exercise name (e.g., Bench Press)"
          placeholderTextColor="#6b7280"
          value={exercise.name}
          onChangeText={handleExerciseNameChange}
          onFocus={() => setShowDropdown(true)}
        />
        
        {/* Dropdown List */}
        {showDropdown && filteredExercises.length > 0 && (
          <View className="mt-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg max-h-48 z-50">
            <ScrollView 
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="always"
            >
              {filteredExercises.map((exerciseName, index) => (
                <Pressable
                  key={index}
                  onPress={() => selectExercise(exerciseName)}
                  className="px-4 py-3 border-b border-[#1a1a1a] active:bg-green-500/10"
                >
                  <Text className="text-white">{exerciseName}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Sets Header */}
      {exercise.sets.length > 0 && (
        <View className="flex-row mb-2 px-2">
          <Text className="text-gray-500 text-xs font-semibold flex-1">SET</Text>
          <Text className="text-gray-500 text-xs font-semibold w-24 text-center">WEIGHT (kg)</Text>
          <Text className="text-gray-500 text-xs font-semibold w-24 text-center">REPS</Text>
          <View className="w-8" />
        </View>
      )}

      {/* Sets List */}
      {exercise.sets.map((set, setIndex) => (
        <View key={set.id} className="flex-row items-center mb-2">
          <View className="flex-1 items-center">
            <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center">
              <Text className="text-green-500 font-bold">{setIndex + 1}</Text>
            </View>
          </View>
          <TextInput
            className="w-24 bg-black rounded-lg px-3 py-2 text-white text-center border border-[#2a2a2a]"
            placeholder="0"
            placeholderTextColor="#6b7280"
            keyboardType="decimal-pad"
            value={set.weight}
            onChangeText={(value) => onUpdateSet(set.id, 'weight', value)}
          />
          <View className="w-3" />
          <TextInput
            className="w-24 bg-black rounded-lg px-3 py-2 text-white text-center border border-[#2a2a2a]"
            placeholder="0"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            value={set.reps}
            onChangeText={(value) => onUpdateSet(set.id, 'reps', value)}
          />
          <Pressable onPress={() => onRemoveSet(set.id)} className="w-8 items-center">
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </Pressable>
        </View>
      ))}

      {/* Add Set Button */}
      <Pressable
        onPress={onAddSet}
        className="bg-black border border-dashed border-[#2a2a2a] rounded-lg py-3 mt-2 items-center active:bg-[#0a0a0a]"
      >
        <View className="flex-row items-center">
          <Ionicons name="add" size={20} color="#6b7280" />
          <Text className="text-gray-400 font-semibold ml-1">Add Set</Text>
        </View>
      </Pressable>
    </View>
  );
};

export default LogStrength;
