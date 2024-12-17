import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import EditContactScreen from './src/screens/EditContactScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Phonebook' }}
        />
        <Stack.Screen 
          name="AddContact" 
          component={AddContactScreen}
          options={{ title: 'Add New Contact' }}
        />
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{ title: 'Edit Contact' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}