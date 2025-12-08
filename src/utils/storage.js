
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: 'auth_user'
};

export const storage = {
  async saveUser(user) {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  async clearUser() {
    await AsyncStorage.removeItem(KEYS.USER);
  }
};
