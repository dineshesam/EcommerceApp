
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import Images from '../assets/images';

export default function CategoriesRow({ onNavigate }) {
  const CATEGORIES = [
    { id: 'mobiles',       name: 'Mobiles',      image: Images.mobilelogo }, // local
    { id: 'laptops',       name: 'Laptops',      image: Images.laptop_logo }, // remote
    { id: 'audio',         name: 'Audio',        image: Images.audiologo },
    { id: 'smartwatches',  name: 'Watches',      image: Images.watchlogo },
    { id: 'camera',        name: 'Cameras',      image: Images.cameralogo },
  ];

  // Helper: returns the correct `source` prop shape
  const getImageSource = (img) => {
    if (typeof img === 'number') return img;       // local require()
    if (typeof img === 'string') return { uri: img }; // remote URL
    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onNavigate?.(item.id)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}
          >
            <Image resizeMode="contain" source={getImageSource(item.image)} style={styles.image} />
            <Text style={styles.label}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
 container: { paddingVertical: 8, backgroundColor: '#fff' },
  list: { paddingHorizontal: 8 },
  item: { alignItems: 'center', marginRight: 14 },
  image: { padding:45,width: 72, height: 72, borderRadius: 36, backgroundColor: '#E5E7EB' },
  label: { marginTop: 6, fontSize: 12, color: '#333', fontWeight: '500' },
  })