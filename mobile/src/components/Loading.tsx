import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LoadingProps } from '../types';

const Loading: React.FC<LoadingProps> = ({ size = 'large', color = '#007AFF' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
