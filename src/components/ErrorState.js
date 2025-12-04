
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle-outline" size={40} color="#E74C3C" />
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity style={styles.btn} onPress={onRetry}>
        <Icon name="refresh" size={18} color="white" />
        <Text style={styles.btnText}>  Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  text: { marginTop: 12, fontSize: 16, textAlign: 'center', color: '#2C3E50' },
  btn: { marginTop: 16, flexDirection: 'row', backgroundColor: '#2E86DE', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
