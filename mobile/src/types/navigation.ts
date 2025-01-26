import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Contact } from './index';

export type RootStackParamList = {
  Home: undefined;
  AddContact: undefined;
  EditContact: { contact: Contact };
  Avatar: { contact: Contact };
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type AddContactScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddContact'>;
export type EditContactScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditContact'>;
export type AvatarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Avatar'>;

export type EditContactScreenRouteProp = RouteProp<RootStackParamList, 'EditContact'>;
export type AvatarScreenRouteProp = RouteProp<RootStackParamList, 'Avatar'>;
