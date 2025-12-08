
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { storage } from '../../utils/storage';

export default function AdminDashboard({ navigation }) {
  const goManage = () => navigation.navigate('ManageProducts');

  const logout = async () => {
    await storage.clearUser();
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TouchableOpacity style={styles.btn} onPress={goManage}>
        <Text style={styles.btnText}>Manage Products</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#ff3b30' }]} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  btn: { backgroundColor: '#0a84ff', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700' }
});
