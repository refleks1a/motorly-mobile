import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SIZE = width * 0.78;

export const ShopSearchIllustration: React.FC = () => (
  <Image
    source={require('@/assets/images/onboarding_shops.png')}
    style={styles.image}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  image: {
    width: SIZE,
    height: SIZE,
  },
});
