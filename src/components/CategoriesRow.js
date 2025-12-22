
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import Images from '../assets/images';
import useDynamicStyles from '../hooks/useDynamicStyles';

export default function CategoriesRow({ onNavigate }) {
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const CATEGORIES = [
    { id: 'mobiles',       name: 'Mobiles',      image: Images.mobilelogo },   // local
    { id: 'laptops',       name: 'Laptops',      image: Images.laptop_logo },  // remote
    { id: 'audio',         name: 'Audio',        image: Images.audiologo },
    { id: 'smartwatches',  name: 'Watches',      image: Images.watchlogo },
    { id: 'camera',        name: 'Cameras',      image: Images.cameralogo },
  ];

  // Helper: returns the correct `source` prop shape
  const getImageSource = (img) => {
    if (typeof img === 'number') return img;        // local require()
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
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed
            ]}
          >
            <Image
              resizeMode="contain"
              source={getImageSource(item.image)}
              style={styles.image}
            />
            <Text style={styles.label}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    // Slightly raised section background to separate from page
    container: {
      paddingVertical: 8,
      backgroundColor: colors.sectionBackground,
      marginBottom: 10
    },
    list: { paddingHorizontal: 8 },

    item: {
      alignItems: 'center',
      marginRight: 14
    },
    itemPressed: {
      opacity: 0.85
      // If you want a subtle outline on press:
      // borderWidth: 1,
      // borderColor: colors.inputBorder,
      // borderRadius: 40
    },

    // Icon pill surface – themed, rounded
    image: {
      padding: 45,
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.tabBackground
    },

    // Category label – readable but not overpowering
    label: {
      marginTop: 6,
      fontSize: 12,
      color: colors.primaryText,   // or colors.secondaryText if you prefer subtler
      fontWeight: '500'
    }
  })
