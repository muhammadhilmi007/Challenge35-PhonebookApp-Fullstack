export interface Contact {
  id: number;
  name: string;
  phone: string;
  photo?: string;
  avatar?: string;
}

export interface ContactData {
  name: string;
  phone: string;
  avatar?: string | null;
}

export interface ContactsResponse {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  AddContact: undefined;
  EditContact: {
    contact: Contact;
  };
  Avatar: {
    contact: Contact;
    onAvatarSelect: (avatar: string | null) => Promise<void>;
  };
};
