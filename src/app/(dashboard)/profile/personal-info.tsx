import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_KEY = "@user_profile";

type FitnessAim = "loss" | "gain" | "maintain";
type SliderField = "height" | "weight";
type WeightUnit = "kg" | "lb";
type HeightUnit = "cm" | "ft";

const PersonalInfo = () => {
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170); // Always stored in cm
  const [weight, setWeight] = useState(70); // Always stored in kg
  const [aim, setAim] = useState<FitnessAim>("maintain");
  
  // Original values to track changes
  const [originalHeight, setOriginalHeight] = useState(170);
  const [originalWeight, setOriginalWeight] = useState(70);
  const [originalAim, setOriginalAim] = useState<FitnessAim>("maintain");
  
  const [showAimModal, setShowAimModal] = useState(false);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [sliderField, setSliderField] = useState<SliderField>("height");
  const [tempValue, setTempValue] = useState(0);
  const [tempFeet, setTempFeet] = useState(5);
  const [tempInches, setTempInches] = useState(7);
  const [hasModalChanges, setHasModalChanges] = useState(false);
  const [hasPageChanges, setHasPageChanges] = useState(false);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");

  const scrollRef = useRef<ScrollView>(null);
  const feetScrollRef = useRef<ScrollView>(null);
  const inchesScrollRef = useRef<ScrollView>(null);
  const ITEM_HEIGHT = 50;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        const profile = JSON.parse(data);
        setGender(profile.gender || "");
        setDob(profile.dob || "");
        
        // Calculate age from DOB
        if (profile.dob) {
          const calculatedAge = calculateAgeFromDOB(profile.dob);
          setAge(calculatedAge);
        }
        
        const loadedHeight = profile.height ? parseInt(profile.height) : 170;
        const loadedWeight = profile.weight ? parseInt(profile.weight) : 70;
        const loadedAim = profile.aim || "maintain";
        
        setHeight(loadedHeight);
        setWeight(loadedWeight);
        setAim(loadedAim);
        
        // Set original values for comparison
        setOriginalHeight(loadedHeight);
        setOriginalWeight(loadedWeight);
        setOriginalAim(loadedAim);
        setHasPageChanges(false);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const calculateAgeFromDOB = (dobString: string) => {
    if (!dobString) return 25;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const saveData = async (field: string, value: string | number | FitnessAim) => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      const profile = data ? JSON.parse(data) : {};
      profile[field] = value.toString();
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const openSliderModal = (field: SliderField) => {
    setSliderField(field);
    if (field === "height") {
      if (heightUnit === "cm") {
        setTempValue(height);
      } else {
        // Convert cm to feet and inches
        const totalInches = height / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setTempFeet(feet);
        setTempInches(inches);
      }
    } else {
      // weight
      if (weightUnit === "kg") {
        setTempValue(weight);
      } else {
        // Convert kg to lb
        setTempValue(Math.round(weight * 2.20462));
      }
    }
    setShowSliderModal(true);
  };

  const handleSliderSave = async () => {
    if (sliderField === "height") {
      let heightInCm = 0;
      if (heightUnit === "cm") {
        heightInCm = tempValue;
      } else {
        // Convert feet and inches to cm
        const totalInches = (tempFeet * 12) + tempInches;
        heightInCm = Math.round(totalInches * 2.54);
      }
      setHeight(heightInCm);
      checkForChanges(heightInCm, weight, aim);
    } else {
      // weight
      let weightInKg = 0;
      if (weightUnit === "kg") {
        weightInKg = tempValue;
      } else {
        // Convert lb to kg
        weightInKg = Math.round(tempValue / 2.20462);
      }
      setWeight(weightInKg);
      checkForChanges(height, weightInKg, aim);
    }
    setShowSliderModal(false);
    setHasModalChanges(false);
  };

  const handleAimChange = async (newAim: FitnessAim) => {
    setAim(newAim);
    checkForChanges(height, weight, newAim);
    setShowAimModal(false);
  };

  const checkForChanges = (currentHeight: number, currentWeight: number, currentAim: FitnessAim) => {
    const hasChanged = 
      currentHeight !== originalHeight || 
      currentWeight !== originalWeight || 
      currentAim !== originalAim;
    setHasPageChanges(hasChanged);
  };

  const handleSaveAll = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      const profile = data ? JSON.parse(data) : {};
      profile.height = height.toString();
      profile.weight = weight.toString();
      profile.aim = aim;
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      
      // Update original values
      setOriginalHeight(height);
      setOriginalWeight(weight);
      setOriginalAim(aim);
      setHasPageChanges(false);
      
      // Navigate back to profile page
      router.back();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const calculateBMI = () => {
    const heightM = height / 100;
    if (heightM && weight) {
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return "--";
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return { label: "Unknown", color: "#6b7280" };
    if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
    if (bmi < 25) return { label: "Healthy", color: "#22c55e" };
    if (bmi < 30) return { label: "Overweight", color: "#eab308" };
    return { label: "Obese", color: "#ef4444" };
  };

  const calculateCalories = () => {
    // Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // Default to average
      bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    // Activity factor (moderate activity level)
    const tdee = bmr * 1.55;

    // Adjust based on aim
    if (aim === "loss") {
      return Math.round(tdee - 500); // 500 calorie deficit
    } else if (aim === "gain") {
      return Math.round(tdee + 300); // 300 calorie surplus
    }
    return Math.round(tdee);
  };

  const getAimLabel = () => {
    if (aim === "loss") return "Weight Loss";
    if (aim === "gain") return "Weight Gain";
    return "Maintain Weight";
  };

  const getAimIcon = () => {
    if (aim === "loss") return "trending-down";
    if (aim === "gain") return "trending-up";
    return "remove";
  };

  const getSliderConfig = () => {
    if (sliderField === "height") {
      if (heightUnit === "cm") {
        return { min: 100, max: 250, unit: "cm", values: Array.from({ length: 151 }, (_, i) => i + 100) };
      } else {
        // For feet/inches, return config for feet and inches separately
        return {
          feet: { min: 3, max: 8, values: Array.from({ length: 6 }, (_, i) => i + 3) },
          inches: { min: 0, max: 11, values: Array.from({ length: 12 }, (_, i) => i) }
        };
      }
    } else {
      // weight
      if (weightUnit === "kg") {
        return { min: 30, max: 200, unit: "kg", values: Array.from({ length: 171 }, (_, i) => i + 30) };
      } else {
        return { min: 66, max: 440, unit: "lb", values: Array.from({ length: 375 }, (_, i) => i + 66) };
      }
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const config = getSliderConfig();
    
    if (sliderField === "height" && heightUnit === "ft") {
      // This shouldn't be called for ft/inches as they have separate handlers
      return;
    }
    
    const values = sliderField === "height" && heightUnit === "cm" 
      ? (config as any).values 
      : (config as any).values;
    
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, values.length - 1));
    const newValue = values[validIndex];
    if (newValue !== tempValue) {
      setTempValue(newValue);
      setHasModalChanges(true);
    }
  };

  const handleFeetScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const config = getSliderConfig() as any;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, config.feet.values.length - 1));
    const newValue = config.feet.values[validIndex];
    if (newValue !== tempFeet) {
      setTempFeet(newValue);
      setHasModalChanges(true);
    }
  };

  const handleInchesScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const config = getSliderConfig() as any;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, config.inches.values.length - 1));
    const newValue = config.inches.values[validIndex];
    if (newValue !== tempInches) {
      setTempInches(newValue);
      setHasModalChanges(true);
    }
  };

  // Scroll to current value when modal opens
  useEffect(() => {
    if (showSliderModal) {
      setTimeout(() => {
        if (sliderField === "height" && heightUnit === "ft") {
          const config = getSliderConfig() as any;
          const feetIndex = config.feet.values.indexOf(tempFeet);
          const inchesIndex = config.inches.values.indexOf(tempInches);
          feetScrollRef.current?.scrollTo({ y: feetIndex * ITEM_HEIGHT, animated: false });
          inchesScrollRef.current?.scrollTo({ y: inchesIndex * ITEM_HEIGHT, animated: false });
        } else {
          const config = getSliderConfig() as any;
          const index = config.values.indexOf(tempValue);
          scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
        }
      }, 100);
    }
  }, [showSliderModal, heightUnit, weightUnit]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6">
          <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Personal Information</Text>
        </View>

        {/* Personal Info Fields */}
        <View className="px-5">
          {/* Gender - Read Only */}
          <View className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1">Gender</Text>
            <Text className="text-white text-lg font-semibold capitalize">{gender || "Not set"}</Text>
          </View>

          {/* Age - Read Only (calculated from DOB) */}
          <View className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1">Age</Text>
            <Text className="text-white text-lg font-semibold">{age} years</Text>
          </View>

          {/* Height with Slider */}
          <Pressable
            onPress={() => openSliderModal("height")}
            className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <Text className="text-gray-400 text-sm mb-1">Height</Text>
            <Text className="text-white text-lg font-semibold">
              {heightUnit === "cm" 
                ? `${height} cm` 
                : `${Math.floor(height / 30.48)}'${Math.round((height / 2.54) % 12)}"`
              }
            </Text>
          </Pressable>

          {/* Weight with Slider */}
          <Pressable
            onPress={() => openSliderModal("weight")}
            className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <Text className="text-gray-400 text-sm mb-1">Weight</Text>
            <Text className="text-white text-lg font-semibold">
              {weightUnit === "kg" 
                ? `${weight} kg` 
                : `${Math.round(weight * 2.20462)} lb`
              }
            </Text>
          </Pressable>

          {/* BMI Card */}
          <View className="bg-[#1a1a1a] rounded-2xl p-6 mb-3 border border-[#2a2a2a]">
            <Text className="text-gray-400 text-sm mb-2">Body Mass Index (BMI)</Text>
            <View className="flex-row items-end">
              <Text className="text-white text-4xl font-bold">{calculateBMI()}</Text>
              <View 
                className="px-3 py-1 rounded-lg ml-4 mb-1"
                style={{ backgroundColor: `${getBMICategory().color}20` }}
              >
                <Text style={{ color: getBMICategory().color }} className="font-semibold text-sm">
                  {getBMICategory().label}
                </Text>
              </View>
            </View>
          </View>

          {/* Fitness Aim */}
          <Pressable
            onPress={() => setShowAimModal(true)}
            className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 active:opacity-80"
          >
            <Text className="text-gray-400 text-sm mb-1">Fitness Aim</Text>
            <View className="flex-row items-center">
              <Ionicons name={getAimIcon() as any} size={20} color="#22c55e" />
              <Text className="text-white text-lg font-semibold ml-2">{getAimLabel()}</Text>
            </View>
          </Pressable>

          {/* Daily Calorie Recommendation */}
          {gender && (
            <View className="bg-green-500/10 rounded-2xl p-6 border border-green-500/30 mb-3">
              <View className="flex-row items-center mb-3">
                <Ionicons name="nutrition" size={24} color="#22c55e" />
                <Text className="text-green-500 text-lg font-bold ml-2">Daily Calorie Target</Text>
              </View>
              <Text className="text-white text-4xl font-bold mb-2">{calculateCalories()} kcal</Text>
              <Text className="text-gray-400 text-sm leading-5">
                Based on your age, height, weight, gender, and {getAimLabel().toLowerCase()} goal, 
                you should consume approximately {calculateCalories()} calories per day.
              </Text>
            </View>
          )}

          {/* Save Button - Appears when changes are made */}
          {hasPageChanges && (
            <View className="mt-4 mb-8">
              <Pressable
                onPress={handleSaveAll}
                className="bg-green-500 rounded-2xl py-4 items-center active:opacity-70 active:scale-95"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <Text className="text-black font-bold text-lg">Save Changes</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Slider Modal */}
      <Modal visible={showSliderModal} animationType="fade" transparent onRequestClose={() => setShowSliderModal(false)}>
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-[#1a1a1a] rounded-3xl p-6 w-[90%] max-w-md border border-[#2a2a2a]">
            {/* Header with Unit Toggle */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold capitalize">{sliderField}</Text>
              
              {/* Unit Toggle Buttons */}
              {sliderField === "weight" && (
                <View className="flex-row bg-[#2a2a2a] rounded-lg p-1">
                  <Pressable
                    onPress={() => setWeightUnit("kg")}
                    className={`px-4 py-2 rounded-md ${weightUnit === "kg" ? "bg-green-500" : ""}`}
                  >
                    <Text className={`font-semibold ${weightUnit === "kg" ? "text-black" : "text-gray-400"}`}>kg</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setWeightUnit("lb")}
                    className={`px-4 py-2 rounded-md ${weightUnit === "lb" ? "bg-green-500" : ""}`}
                  >
                    <Text className={`font-semibold ${weightUnit === "lb" ? "text-black" : "text-gray-400"}`}>lb</Text>
                  </Pressable>
                </View>
              )}
              
              {sliderField === "height" && (
                <View className="flex-row bg-[#2a2a2a] rounded-lg p-1">
                  <Pressable
                    onPress={() => setHeightUnit("cm")}
                    className={`px-4 py-2 rounded-md ${heightUnit === "cm" ? "bg-green-500" : ""}`}
                  >
                    <Text className={`font-semibold ${heightUnit === "cm" ? "text-black" : "text-gray-400"}`}>cm</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setHeightUnit("ft")}
                    className={`px-4 py-2 rounded-md ${heightUnit === "ft" ? "bg-green-500" : ""}`}
                  >
                    <Text className={`font-semibold ${heightUnit === "ft" ? "text-black" : "text-gray-400"}`}>ft</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View className="mb-6">
              {/* Single Slider for cm/kg/lb */}
              {(sliderField === "weight" || (sliderField === "height" && heightUnit === "cm")) && (
                <View className="relative h-[200px] bg-[#0a0a0a] rounded-xl border border-[#2a2a2a] overflow-hidden">
                  {/* Selection highlight */}
                  <View 
                    className="absolute left-0 right-0 h-[50px] border-y-2 border-green-500/50 bg-green-500/10" 
                    style={{ top: 75 }} 
                  />

                  {/* Top gradient overlay */}
                  <View 
                    className="absolute top-0 left-0 right-0 h-[75px] pointer-events-none z-10"
                    style={{
                      backgroundColor: 'transparent',
                      backgroundImage: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
                    }}
                  />
                  
                  {/* Bottom gradient overlay */}
                  <View 
                    className="absolute bottom-0 left-0 right-0 h-[75px] pointer-events-none z-10"
                    style={{
                      backgroundColor: 'transparent',
                      backgroundImage: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
                    }}
                  />

                  {/* Scrollable picker */}
                  <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingVertical: 75 }}
                  >
                    {(getSliderConfig() as any).values?.map((value: number) => (
                      <View key={value} className="h-[50px] items-center justify-center">
                        <Text 
                          className={`text-2xl font-semibold ${
                            value === tempValue ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {value} {(getSliderConfig() as any).unit}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Dual Slider for feet/inches */}
              {sliderField === "height" && heightUnit === "ft" && (
                <View className="relative h-[200px] bg-[#0a0a0a] rounded-xl border border-[#2a2a2a] overflow-hidden">
                  {/* Selection highlight */}
                  <View 
                    className="absolute left-0 right-0 h-[50px] border-y-2 border-green-500/50 bg-green-500/10" 
                    style={{ top: 75 }} 
                  />

                  {/* Top gradient overlay */}
                  <View 
                    className="absolute top-0 left-0 right-0 h-[75px] pointer-events-none z-10"
                    style={{
                      backgroundColor: 'transparent',
                      backgroundImage: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
                    }}
                  />
                  
                  {/* Bottom gradient overlay */}
                  <View 
                    className="absolute bottom-0 left-0 right-0 h-[75px] pointer-events-none z-10"
                    style={{
                      backgroundColor: 'transparent',
                      backgroundImage: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
                    }}
                  />

                  <View className="flex-row h-full">
                    {/* Feet Picker */}
                    <ScrollView
                      ref={feetScrollRef}
                      className="flex-1"
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onScroll={handleFeetScroll}
                      scrollEventThrottle={16}
                      contentContainerStyle={{ paddingVertical: 75 }}
                    >
                      {(getSliderConfig() as any).feet.values.map((value: number) => (
                        <View key={value} className="h-[50px] items-center justify-center">
                          <Text 
                            className={`text-2xl font-semibold ${
                              value === tempFeet ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {value} ft
                          </Text>
                        </View>
                      ))}
                    </ScrollView>

                    {/* Inches Picker */}
                    <ScrollView
                      ref={inchesScrollRef}
                      className="flex-1"
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onScroll={handleInchesScroll}
                      scrollEventThrottle={16}
                      contentContainerStyle={{ paddingVertical: 75 }}
                    >
                      {(getSliderConfig() as any).inches.values.map((value: number) => (
                        <View key={value} className="h-[50px] items-center justify-center">
                          <Text 
                            className={`text-2xl font-semibold ${
                              value === tempInches ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {value} in
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
              
              <Text className="text-center text-gray-400 text-sm mt-4">
                Scroll to adjust your {sliderField}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowSliderModal(false);
                  setHasModalChanges(false);
                }}
                className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center active:opacity-70"
              >
                <Text className="text-gray-400 font-semibold text-base">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleSliderSave} 
                className={`flex-1 rounded-xl py-3 items-center ${
                  hasModalChanges ? 'bg-green-500 active:opacity-70' : 'bg-gray-600 opacity-50'
                }`}
                disabled={!hasModalChanges}
              >
                <Text className="text-black font-bold text-base">Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Aim Selection Modal */}
      <Modal visible={showAimModal} animationType="fade" transparent onRequestClose={() => setShowAimModal(false)}>
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-[#1a1a1a] rounded-3xl p-6 w-[90%] max-w-md border border-[#2a2a2a]">
            <Text className="text-white text-xl font-bold mb-6">Choose Your Fitness Aim</Text>

            <Pressable
              onPress={() => handleAimChange("loss")}
              className={`flex-row items-center p-4 rounded-xl mb-3 ${aim === "loss" ? "bg-green-500/20 border-2 border-green-500" : "bg-[#2a2a2a]"} active:opacity-70`}
            >
              <Ionicons name="trending-down" size={24} color={aim === "loss" ? "#22c55e" : "#ffffff"} />
              <View className="flex-1 ml-3">
                <Text className={`text-lg font-semibold ${aim === "loss" ? "text-green-500" : "text-white"}`}>Weight Loss</Text>
                <Text className="text-gray-400 text-sm">Reduce body weight</Text>
              </View>
              {aim === "loss" && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            </Pressable>

            <Pressable
              onPress={() => handleAimChange("maintain")}
              className={`flex-row items-center p-4 rounded-xl mb-3 ${aim === "maintain" ? "bg-green-500/20 border-2 border-green-500" : "bg-[#2a2a2a]"} active:opacity-70`}
            >
              <Ionicons name="remove" size={24} color={aim === "maintain" ? "#22c55e" : "#ffffff"} />
              <View className="flex-1 ml-3">
                <Text className={`text-lg font-semibold ${aim === "maintain" ? "text-green-500" : "text-white"}`}>Maintain Weight</Text>
                <Text className="text-gray-400 text-sm">Keep current weight</Text>
              </View>
              {aim === "maintain" && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            </Pressable>

            <Pressable
              onPress={() => handleAimChange("gain")}
              className={`flex-row items-center p-4 rounded-xl mb-6 ${aim === "gain" ? "bg-green-500/20 border-2 border-green-500" : "bg-[#2a2a2a]"} active:opacity-70`}
            >
              <Ionicons name="trending-up" size={24} color={aim === "gain" ? "#22c55e" : "#ffffff"} />
              <View className="flex-1 ml-3">
                <Text className={`text-lg font-semibold ${aim === "gain" ? "text-green-500" : "text-white"}`}>Weight Gain</Text>
                <Text className="text-gray-400 text-sm">Increase muscle mass</Text>
              </View>
              {aim === "gain" && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            </Pressable>

            <Pressable
              onPress={() => setShowAimModal(false)}
              className="bg-[#2a2a2a] rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-gray-400 font-semibold text-base">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PersonalInfo;
