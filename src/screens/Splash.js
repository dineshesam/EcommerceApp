
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { storage } from '../utils/storage';

export default function Splash({ navigation }) {
  useEffect(() => {
    const bootstrap = async () => {
      const user = await storage.getUser();
      setTimeout(() => {
        if (user?.role === 'admin') navigation.replace('Admin');
        else if (user?.role === 'user') navigation.replace('User');
        else navigation.replace('Auth');
      }, 600); // small delay for splash feel
    };
    bootstrap();
  }, [navigation]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
