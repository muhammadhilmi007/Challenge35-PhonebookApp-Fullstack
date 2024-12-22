import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#f4511e" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
});

export default Loading;