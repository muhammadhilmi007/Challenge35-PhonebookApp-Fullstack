import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppRegistry, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import EditContactScreen from './src/screens/EditContactScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import { RootStackParamList } from './src/types';

// Define the type for the contact object
export interface Contact {
  id: number;
  name: string;
  phone: string;
  photo?: string;
  avatar?: string;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#fff',
  },
  headerTitleStyle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
});

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="AddContact" 
          component={AddContactScreen}
          options={{
            headerShown: true,
            title: 'Add New Contact',
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
            headerTintColor: '#007AFF',
          }}
        />
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{
            headerShown: true,
            title: 'Edit Contact',
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
            headerTintColor: '#007AFF',
          }}
        />
        <Stack.Screen 
          name="Avatar" 
          component={AvatarScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

AppRegistry.registerComponent('mobile', () => App);

export default App;
