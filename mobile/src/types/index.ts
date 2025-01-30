export interface Contact {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  avatar?: string;
  status?: 'pending' | undefined;
  sent?: boolean;
}

export interface ContactsResponse {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
}

export interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => Promise<void>;
  onDelete: () => void;
  onAvatarPress: () => void;
  onResend?: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  isEditing: boolean;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
}

export interface LoadingProps {
  size?: number | 'small' | 'large';
  color?: string;
}

// Navigation Types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
