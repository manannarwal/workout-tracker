// Temporary script to clear all user data
// Run this in your app's dev console or add a button to trigger it

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllUserData() {
  try {
    console.log('Starting to clear all data...');
    
    // Clear all AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    console.log('Found AsyncStorage keys:', keys);
    await AsyncStorage.multiRemove(keys);
    console.log('AsyncStorage cleared');
    
    // Clear common SecureStore keys (we need to know the keys to delete them)
    // This won't clear all SecureStore items since we don't have a list function
    console.log('SecureStore items need to be deleted individually with known keys');
    console.log('All AsyncStorage data cleared successfully!');
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
