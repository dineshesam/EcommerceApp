
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#666', marginTop: 8, textAlign: 'center' }
});
