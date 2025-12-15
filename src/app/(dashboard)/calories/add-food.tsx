import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CALORIES_KEY = "@consumed_calories";

type FoodItem = {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
};

type ConsumedFood = FoodItem & {
  consumedAt: string;
  quantity: number;
};

const FOOD_DATABASE: FoodItem[] = [
  // Indian Breakfast
  { id: "1", name: "Idli (2 pcs)", category: "Indian Breakfast", calories: 78, protein: 2, carbs: 17, fats: 0.5, servingSize: "2 pieces" },
  { id: "2", name: "Dosa (Plain)", category: "Indian Breakfast", calories: 133, protein: 3, carbs: 22, fats: 4, servingSize: "1 dosa" },
  { id: "3", name: "Masala Dosa", category: "Indian Breakfast", calories: 285, protein: 6, carbs: 42, fats: 10, servingSize: "1 dosa" },
  { id: "4", name: "Poha", category: "Indian Breakfast", calories: 250, protein: 5, carbs: 40, fats: 8, servingSize: "1 bowl" },
  { id: "5", name: "Upma", category: "Indian Breakfast", calories: 193, protein: 5, carbs: 33, fats: 5, servingSize: "1 bowl" },
  { id: "6", name: "Paratha (Plain)", category: "Indian Breakfast", calories: 210, protein: 4, carbs: 28, fats: 9, servingSize: "1 paratha" },
  { id: "7", name: "Aloo Paratha", category: "Indian Breakfast", calories: 330, protein: 6, carbs: 45, fats: 14, servingSize: "1 paratha" },
  
  // Indian Main Course
  { id: "8", name: "Dal Tadka", category: "Indian Main Course", calories: 144, protein: 8, carbs: 20, fats: 4, servingSize: "1 bowl" },
  { id: "9", name: "Rajma Curry", category: "Indian Main Course", calories: 186, protein: 10, carbs: 26, fats: 5, servingSize: "1 bowl" },
  { id: "10", name: "Chole (Chickpea Curry)", category: "Indian Main Course", calories: 210, protein: 12, carbs: 30, fats: 6, servingSize: "1 bowl" },
  { id: "11", name: "Paneer Butter Masala", category: "Indian Main Course", calories: 380, protein: 14, carbs: 18, fats: 28, servingSize: "1 bowl" },
  { id: "12", name: "Palak Paneer", category: "Indian Main Course", calories: 285, protein: 12, carbs: 15, fats: 20, servingSize: "1 bowl" },
  { id: "13", name: "Chicken Curry", category: "Indian Main Course", calories: 240, protein: 28, carbs: 8, fats: 12, servingSize: "1 bowl" },
  { id: "14", name: "Butter Chicken", category: "Indian Main Course", calories: 490, protein: 30, carbs: 12, fats: 35, servingSize: "1 bowl" },
  { id: "15", name: "Biryani (Chicken)", category: "Indian Main Course", calories: 420, protein: 24, carbs: 52, fats: 14, servingSize: "1 plate" },
  { id: "16", name: "Biryani (Veg)", category: "Indian Main Course", calories: 340, protein: 8, carbs: 55, fats: 10, servingSize: "1 plate" },
  
  // Rice & Bread
  { id: "17", name: "White Rice (Cooked)", category: "Rice & Bread", calories: 206, protein: 4, carbs: 45, fats: 0.5, servingSize: "1 bowl" },
  { id: "18", name: "Brown Rice (Cooked)", category: "Rice & Bread", calories: 218, protein: 5, carbs: 46, fats: 2, servingSize: "1 bowl" },
  { id: "19", name: "Jeera Rice", category: "Rice & Bread", calories: 240, protein: 4, carbs: 48, fats: 4, servingSize: "1 bowl" },
  { id: "20", name: "Roti (Chapati)", category: "Rice & Bread", calories: 71, protein: 3, carbs: 15, fats: 0.4, servingSize: "1 roti" },
  { id: "21", name: "Naan", category: "Rice & Bread", calories: 262, protein: 9, carbs: 45, fats: 5, servingSize: "1 naan" },
  { id: "22", name: "Butter Naan", category: "Rice & Bread", calories: 310, protein: 9, carbs: 46, fats: 10, servingSize: "1 naan" },
  
  // Snacks
  { id: "23", name: "Samosa", category: "Indian Snacks", calories: 252, protein: 4, carbs: 28, fats: 14, servingSize: "1 piece" },
  { id: "24", name: "Pakora", category: "Indian Snacks", calories: 180, protein: 4, carbs: 20, fats: 10, servingSize: "100g" },
  { id: "25", name: "Vada Pav", category: "Indian Snacks", calories: 290, protein: 6, carbs: 42, fats: 11, servingSize: "1 piece" },
  { id: "26", name: "Pani Puri (6 pcs)", category: "Indian Snacks", calories: 125, protein: 3, carbs: 22, fats: 3, servingSize: "6 pieces" },
  { id: "27", name: "Bhel Puri", category: "Indian Snacks", calories: 175, protein: 4, carbs: 28, fats: 6, servingSize: "1 bowl" },
  
  // Western Foods
  { id: "28", name: "Pizza (Margherita)", category: "Western", calories: 266, protein: 11, carbs: 33, fats: 10, servingSize: "1 slice" },
  { id: "29", name: "Burger", category: "Western", calories: 295, protein: 17, carbs: 30, fats: 12, servingSize: "1 burger" },
  { id: "30", name: "Pasta (Red Sauce)", category: "Western", calories: 220, protein: 8, carbs: 42, fats: 3, servingSize: "1 bowl" },
  { id: "31", name: "Pasta (White Sauce)", category: "Western", calories: 310, protein: 10, carbs: 38, fats: 14, servingSize: "1 bowl" },
  { id: "32", name: "French Fries", category: "Western", calories: 312, protein: 4, carbs: 41, fats: 15, servingSize: "medium" },
  { id: "33", name: "Fried Chicken", category: "Western", calories: 246, protein: 19, carbs: 12, fats: 14, servingSize: "1 piece" },
  
  // Beverages
  { id: "34", name: "Chai (Tea with Milk)", category: "Beverages", calories: 74, protein: 2, carbs: 10, fats: 3, servingSize: "1 cup" },
  { id: "35", name: "Coffee (with Milk)", category: "Beverages", calories: 38, protein: 2, carbs: 4, fats: 1.5, servingSize: "1 cup" },
  { id: "36", name: "Lassi (Sweet)", category: "Beverages", calories: 180, protein: 6, carbs: 28, fats: 5, servingSize: "1 glass" },
  { id: "37", name: "Mango Shake", category: "Beverages", calories: 250, protein: 6, carbs: 48, fats: 4, servingSize: "1 glass" },
  { id: "38", name: "Soft Drink", category: "Beverages", calories: 140, protein: 0, carbs: 39, fats: 0, servingSize: "330ml" },
  
  // Fruits
  { id: "39", name: "Banana", category: "Fruits", calories: 105, protein: 1, carbs: 27, fats: 0.3, servingSize: "1 medium" },
  { id: "40", name: "Apple", category: "Fruits", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, servingSize: "1 medium" },
  { id: "41", name: "Mango", category: "Fruits", calories: 135, protein: 1, carbs: 35, fats: 0.6, servingSize: "1 medium" },
  { id: "42", name: "Orange", category: "Fruits", calories: 62, protein: 1, carbs: 15, fats: 0.2, servingSize: "1 medium" },
  
  // Eggs & Dairy
  { id: "43", name: "Boiled Egg", category: "Eggs & Dairy", calories: 78, protein: 6, carbs: 0.6, fats: 5, servingSize: "1 egg" },
  { id: "44", name: "Omelette (2 eggs)", category: "Eggs & Dairy", calories: 184, protein: 14, carbs: 2, fats: 14, servingSize: "2 eggs" },
  { id: "45", name: "Milk (Full Fat)", category: "Eggs & Dairy", calories: 149, protein: 8, carbs: 12, fats: 8, servingSize: "1 cup" },
  { id: "46", name: "Curd (Plain)", category: "Eggs & Dairy", calories: 98, protein: 6, carbs: 7, fats: 5, servingSize: "1 bowl" },
  { id: "47", name: "Paneer", category: "Eggs & Dairy", calories: 265, protein: 18, carbs: 4, fats: 20, servingSize: "100g" },
];

const AddFood = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("1");

  const categories = ["All", ...Array.from(new Set(FOOD_DATABASE.map((f) => f.category)))];

  const filteredFoods = FOOD_DATABASE.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addFood = async (food: FoodItem, qty: number) => {
    try {
      const consumedFood: ConsumedFood = {
        ...food,
        quantity: qty,
        consumedAt: new Date().toISOString(),
        calories: food.calories * qty,
        protein: food.protein * qty,
        carbs: food.carbs * qty,
        fats: food.fats * qty,
      };

      const existingData = await AsyncStorage.getItem(CALORIES_KEY);
      const allStoredFoods = existingData ? JSON.parse(existingData) : [];
      allStoredFoods.push(consumedFood);
      await AsyncStorage.setItem(CALORIES_KEY, JSON.stringify(allStoredFoods));
      
      router.back();
    } catch (error) {
      console.error("Error adding food:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Pressable>
        <Text className="text-white text-2xl font-bold">Add Food</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View className="px-5 py-3">
        <View className="flex-row items-center bg-[#1a1a1a] rounded-xl px-4 py-3 border border-[#2a2a2a]">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search foods..."
            placeholderTextColor="#6b7280"
            className="flex-1 text-white ml-2 text-base"
          />
        </View>
      </View>

      {/* Category Filter */}
      <View className="mb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg ${
                selectedCategory === cat ? "bg-green-500" : "bg-[#1a1a1a] border border-[#2a2a2a]"
              } active:opacity-80`}
            >
              <Text className={`text-xs font-medium ${
                selectedCategory === cat ? "text-black" : "text-gray-400"
              }`}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Food List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredFoods.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => {
              setSelectedFood(food);
              setQuantity("1");
              setShowQuantityModal(true);
            }}
            className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-[#2a2a2a] active:opacity-60"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">{food.name}</Text>
                <Text className="text-gray-400 text-xs">{food.servingSize}</Text>
              </View>
              <Text className="text-green-500 text-lg font-bold">{food.calories} kcal</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-[#2a2a2a]">
              <Text className="text-blue-400 text-xs">P: {food.protein}g</Text>
              <Text className="text-yellow-400 text-xs">C: {food.carbs}g</Text>
              <Text className="text-red-400 text-xs">F: {food.fats}g</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Quantity Modal */}
      <Modal 
        visible={showQuantityModal} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center">
          <Pressable 
            className="absolute inset-0" 
            onPress={() => setShowQuantityModal(false)}
          />
          <View className="bg-[#1a1a1a] rounded-3xl p-6 w-[90%] max-w-md border border-[#2a2a2a]">
            <Text className="text-white text-xl font-bold mb-4">How many servings?</Text>
            
            {selectedFood && (
              <View className="bg-[#0a0a0a] rounded-xl p-4 mb-4 border border-[#2a2a2a]">
                <Text className="text-white text-lg font-semibold mb-1">{selectedFood.name}</Text>
                <Text className="text-gray-400 text-sm">{selectedFood.servingSize} = {selectedFood.calories} kcal</Text>
              </View>
            )}

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="Enter quantity"
              placeholderTextColor="#6b7280"
              className="bg-[#2a2a2a] rounded-xl px-4 py-3 text-white text-base mb-6"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowQuantityModal(false)}
                className="flex-1 bg-[#2a2a2a] rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-400 font-semibold text-base">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (selectedFood && parseFloat(quantity) > 0) {
                    addFood(selectedFood, parseFloat(quantity));
                    setShowQuantityModal(false);
                  }
                }}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-black font-bold text-base">Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddFood;
