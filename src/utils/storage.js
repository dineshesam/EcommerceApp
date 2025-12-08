import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) { console.log("Storage error:", err); }
};

export const getItem = async (key) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val != null ? JSON.parse(val) : null;
  } catch (err) { console.log("Storage error:", err); }
};

export const removeItem = async (key) => {
  try { await AsyncStorage.removeItem(key); }
  catch (err) { console.log("Storage error:", err); }
};
