
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ProductListScreen from './src/screens/ProductListScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ProductListScreen />
    </SafeAreaView>
  );
}
