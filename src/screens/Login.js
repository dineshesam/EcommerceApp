
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../api/client';
import { storage } from '../utils/storage';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const user = await api.login(email.trim(), password.trim());
      await storage.saveUser(user);
      if (user.role === 'admin') navigation.replace('Admin');
      else navigation.replace('User');
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={onLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    color: '#000'
  },
  btn: {
    backgroundColor: '#0a84ff', // Default blue
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: '700' }
});
