import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppRegistry } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import EditContactScreen from './src/screens/EditContactScreen';
import AvatarScreen from './src/screens/AvatarScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
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
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitleStyle: {
              color: '#000',
              fontSize: 17,
              fontWeight: '600',
            },
            headerTintColor: '#007AFF',
          }}
        />
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{
            headerShown: true,
            title: 'Edit Contact',
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitleStyle: {
              color: '#000',
              fontSize: 17,
              fontWeight: '600',
            },
            headerTintColor: '#007AFF',
          }}
        />
        <Stack.Screen 
          name="Avatar" 
          component={AvatarScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('mobile', () => App);

export default App;