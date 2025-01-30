# 1. Proses `npm start` di React Native
## Deskripsi
Proses ini menginisialisasi dan menjalankan aplikasi React Native Phonebook di lingkungan development.

## Alur Proses
1. Menjalankan Babel transpiler
2. Kompilasi kode TypeScript
3. Memuat dependensi dari package.json
4. Menginisialisasi Redux store
5. Memulai server development

## Penjelasan Detail Setiap Tahap
1. Babel transpiler:
   - Mengompilasi dan mentransform kode JavaScript/TypeScript
   - Menyediakan hot reloading untuk development
   
   ```javascript
   // babel.config.js
   module.exports = function(api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         [
           'module-resolver',
           {
             root: ['./src'],
             extensions: ['.ios.js', '.android.js', '.js', '.json'],
             alias: {
               '@components': './src/components',
               '@screens': './src/screens',
               '@services': './src/services',
               '@hooks': './src/hooks',
             },
           },
         ],
         'react-native-reanimated/plugin',
       ],
     };
   };
   ```
   
2. Kompilasi TypeScript:
   - Mengonversi kode TypeScript ke JavaScript
   - Melakukan type checking
   
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "target": "esnext",
       "module": "commonjs",
       "lib": ["es2017"],
       "allowJs": true,
       "jsx": "react-native",
       "noEmit": true,
       "isolatedModules": true,
       "strict": true,
       "moduleResolution": "node",
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true,
       "skipLibCheck": true
     },
     "exclude": [
       "node_modules"
     ]
   }
   ```
   
3. Dependensi:
   ```json
   // package.json
   {
     "dependencies": {
       "@react-navigation/native": "^6.x.x",
       "@react-navigation/native-stack": "^6.x.x",
       "@reduxjs/toolkit": "^1.x.x",
       "react": "18.x.x",
       "react-native": "0.7x.x",
       "react-redux": "^8.x.x",
       "expo": "~48.0.18",
       "expo-status-bar": "~1.4.4",
       "expo-image-picker": "~14.1.1"
     }
   }
   ```

4. Redux Store:
   ```typescript
   // store/store.ts
   import { configureStore } from '@reduxjs/toolkit';
   import contactsReducer from './contactsSlice';

   export const store = configureStore({
     reducer: {
       contacts: contactsReducer
     }
   });

   export type RootState = ReturnType<typeof store.getState>;
   export type AppDispatch = typeof store.dispatch;
   ```

5. Entry Point Aplikasi:
   ```typescript
   // App.tsx
   import React from 'react';
   import { Provider } from 'react-redux';
   import { NavigationContainer } from '@react-navigation/native';
   import { createNativeStackNavigator } from '@react-navigation/native-stack';
   import { StatusBar } from 'expo-status-bar';
   import { AppRegistry } from 'react-native';
   import HomeScreen from './src/screens/HomeScreen';
   import AddContactScreen from './src/screens/AddContactScreen';
   import EditContactScreen from './src/screens/EditContactScreen';
   import AvatarScreen from './src/screens/AvatarScreen';
   import { RootStackParamList } from './src/types/index';
   import { store } from './src/store/store';

   const Stack = createNativeStackNavigator<RootStackParamList>();

   const App: React.FC = () => {
     return (
       <Provider store={store}>
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
                 headerStyle: {
                   backgroundColor: '#fff',
                 },
                 headerShadowVisible: false,
               }}
             />
             <Stack.Screen 
               name="EditContact" 
               component={EditContactScreen}
             />
             <Stack.Screen 
               name="Avatar" 
               component={AvatarScreen}
             />
           </Stack.Navigator>
         </NavigationContainer>
       </Provider>
     );
   };

   AppRegistry.registerComponent('mobile', () => App);

   export default App;
   ```

## Komponen yang Terlibat
- App.tsx: Entry point aplikasi
- store/store.ts: Konfigurasi Redux store
- package.json: Daftar dependensi
- tsconfig.json: Konfigurasi TypeScript
- babel.config.js: Konfigurasi Babel transpiler

Untuk menjalankan aplikasi, gunakan perintah:
```bash
npm start
# atau
npx expo start
```

Ini akan memulai Expo development server dan membuka browser dengan QR code untuk menjalankan aplikasi di perangkat fisik atau emulator.

# 2. Proses Menampilkan Halaman Main Page setelah npm start
## Deskripsi
Proses ini menjelaskan bagaimana aplikasi merender halaman utama yang menampilkan daftar kontak.

## Alur Proses
1. Inisialisasi NavigationContainer
2. Mounting komponen HomeScreen
3. Fetching data kontak
4. Rendering daftar kontak
5. Setup fitur pencarian dan pengurutan

## Penjelasan Detail Setiap Tahap
1. NavigationContainer:
   ```typescript
   <NavigationContainer>
     <Stack.Navigator>
       <Stack.Screen name="Home" component={HomeScreen} />
     </Stack.Navigator>
   </NavigationContainer>
   ```

2. HomeScreen:
   ```typescript
   const HomeScreen = () => {
     const [search, setSearch] = useState('');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
     // ... state lainnya
   };
   ```

3. Fetching Data:
   ```typescript
   useEffect(() => {
     dispatch(fetchContacts({ page, search, sortOrder }));
   }, [page, debouncedSearchValue, sortOrder]);
   ```

4. Rendering:
   ```typescript
   return (
     <FlatList
       data={contacts}
       renderItem={({ item }) => (
         <ContactCard
           contact={item}
           onEdit={handleEdit}
           onDelete={handleDelete}
         />
       )}
     />
   );
   ```

## Komponen yang Terlibat
- HomeScreen.tsx
- ContactCard.tsx
- SearchBar.tsx
- Navigation setup di App.tsx
- Redux store dan contactsSlice

# 3. Proses Menampilkan Halaman Add Contact
## Deskripsi
Proses untuk menambahkan kontak baru ke dalam aplikasi.

## Alur Proses
1. Navigasi ke halaman Add Contact
2. Inisialisasi form input
3. Validasi input
4. Proses penyimpanan
5. Navigasi kembali ke Home

## Penjelasan Detail Setiap Tahap
1. Navigasi:
   ```typescript
   navigation.navigate('AddContact');
   ```

2. Form Input:
   ```typescript
   const [formData, setFormData] = useState({
     name: '',
     phone: '',
     email: '',
   });
   ```

3. Validasi:
   ```typescript
   const validateForm = () => {
     if (!formData.name || !formData.phone) {
       return false;
     }
     return true;
   };
   ```

4. Penyimpanan:
   ```typescript
   const handleSave = async () => {
     if (validateForm()) {
       await dispatch(addContact(formData));
       navigation.goBack();
     }
   };
   ```

## Komponen yang Terlibat
- AddContactScreen.tsx
- Form components
- Redux actions
- Navigation stack

# 4. Proses Fitur Edit Contact
## Deskripsi
Proses untuk mengubah informasi kontak yang sudah ada.

## Alur Proses
1. Memilih kontak untuk diedit
2. Navigasi ke halaman edit
3. Menampilkan form dengan data existing
4. Validasi dan penyimpanan perubahan
5. Update state dan UI

## Penjelasan Detail Setiap Tahap
1. Navigasi dengan Data:
   ```typescript
   navigation.navigate('EditContact', { contact });
   ```

2. Form dengan Data Existing:
   ```typescript
   const [formData, setFormData] = useState({
     name: contact.name,
     phone: contact.phone,
     email: contact.email,
   });
   ```

3. Proses Update:
   ```typescript
   const handleUpdate = async () => {
     await dispatch(updateContact({ id: contact.id, ...formData }));
     navigation.goBack();
   };
   ```

## Komponen yang Terlibat
- EditContactScreen.tsx
- ContactCard.tsx
- Redux actions untuk update
- Navigation stack

# 5. Proses Fitur Upload Avatar
## Deskripsi
Proses untuk mengunggah dan mengubah avatar kontak.

## Alur Proses
1. Memilih kontak untuk diubah avatar
2. Membuka image picker
3. Upload gambar
4. Update UI dengan avatar baru

## Penjelasan Detail Setiap Tahap
1. Image Picker:
   ```typescript
   const pickImage = async () => {
     const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsEditing: true,
       aspect: [1, 1],
       quality: 1,
     });
   };
   ```

2. Upload:
   ```typescript
   const handleUpload = async (imageUri) => {
     await dispatch(uploadAvatar({ contactId, imageUri }));
   };
   ```

## Komponen yang Terlibat
- AvatarScreen.tsx
- Image picker library
- Redux actions untuk upload
- Backend API endpoints

# 6. Proses Fitur Delete Contact
## Deskripsi
Proses untuk menghapus kontak dari aplikasi.

## Alur Proses
1. Memilih kontak untuk dihapus
2. Konfirmasi penghapusan
3. Proses delete
4. Update UI

## Penjelasan Detail Setiap Tahap
1. Konfirmasi:
   ```typescript
   const confirmDelete = (contact) => {
     Alert.alert(
       'Konfirmasi',
       'Apakah Anda yakin ingin menghapus kontak ini?',
       [
         { text: 'Batal' },
         { text: 'Hapus', onPress: () => handleDelete(contact.id) }
       ]
     );
   };
   ```

2. Proses Delete:
   ```typescript
   const handleDelete = async (id) => {
     await dispatch(deleteContact(id));
   };
   ```

## Komponen yang Terlibat
- HomeScreen.tsx
- ContactCard.tsx
- Redux actions untuk delete
- Alert component

# 7. Proses Fitur Search Contact
## Deskripsi
Proses pencarian kontak berdasarkan nama atau nomor telepon.

## Alur Proses
1. Input kata kunci pencarian
2. Debouncing input
3. Fetch data yang difilter
4. Update UI dengan hasil pencarian

## Penjelasan Detail Setiap Tahap
1. Search Input:
   ```typescript
   const [search, setSearch] = useState('');
   const debouncedSearch = useDebounce(search, 500);
   ```

2. Fetch Data:
   ```typescript
   useEffect(() => {
     dispatch(fetchContacts({ search: debouncedSearch }));
   }, [debouncedSearch]);
   ```

## Komponen yang Terlibat
- SearchBar.tsx
- HomeScreen.tsx
- Redux actions untuk search
- Debounce utility

# 8. Proses Fitur Search, Sorting, dan Edit Contact
## Deskripsi
Kombinasi fitur pencarian, pengurutan, dan edit kontak.

## Alur Proses
1. Input pencarian
2. Pemilihan urutan (asc/desc)
3. Fetch data terfilter dan terurut
4. Tampilkan hasil
5. Edit kontak dari hasil pencarian

## Penjelasan Detail Setiap Tahap
1. State Management:
   ```typescript
   const [search, setSearch] = useState('');
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
   ```

2. Fetch Data:
   ```typescript
   useEffect(() => {
     dispatch(fetchContacts({ 
       search: debouncedSearch,
       sortOrder,
       page 
     }));
   }, [debouncedSearch, sortOrder, page]);
   ```

## Komponen yang Terlibat
- HomeScreen.tsx
- SearchBar.tsx
- SortButton.tsx
- Redux actions

# 9. Proses Fitur Searching dan Navigation
## Deskripsi
Integrasi antara fitur pencarian dan navigasi antar halaman.

## Alur Proses
1. Pencarian kontak
2. Navigasi ke detail kontak
3. Kembali ke hasil pencarian
4. Maintain state pencarian

## Penjelasan Detail Setiap Tahap
1. Navigation dengan Search State:
   ```typescript
   navigation.navigate('ContactDetail', {
     contact,
     returnToSearch: true,
     searchQuery: currentSearch
   });
   ```

## Komponen yang Terlibat
- Navigation stack
- SearchBar.tsx
- HomeScreen.tsx
- DetailScreen.tsx

# 10. Proses Fitur searching dan sorting
## Deskripsi
Proses pencarian dan pengurutan kontak secara real-time.

## Alur Proses
1. Input keyword pencarian
2. Aplikasi debouncing
3. Pemilihan urutan
4. Fetch dan update data
5. Render hasil

## Penjelasan Detail Setiap Tahap
1. Search dan Sort Logic:
   ```typescript
   const handleSearch = (text) => {
     setSearch(text);
     setPage(1); // Reset pagination
   };

   const handleSort = () => {
     setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
     setPage(1); // Reset pagination
   };
   ```

## Komponen yang Terlibat
- HomeScreen.tsx
- SearchBar.tsx
- SortButton.tsx
- Redux actions

# 11. Proses Fitur Searching dan Navigation
## Deskripsi
Integrasi pencarian dengan navigasi antar screen.

## Alur Proses
1. Pencarian kontak
2. Navigasi dengan parameter
3. Preserve search state
4. Back navigation

## Penjelasan Detail Setiap Tahap
1. Navigation dengan Search:
   ```typescript
   navigation.navigate('ContactDetail', {
     contact,
     previousSearch: searchValue
   });
   ```

## Komponen yang Terlibat
- Navigation stack
- SearchBar.tsx
- HomeScreen.tsx
- DetailScreen.tsx

# 12. Proses Fitur Resend Saat Server Offline dan Online
## Deskripsi
Mekanisme retry untuk operasi yang gagal saat offline.

## Alur Proses
1. Deteksi status koneksi
2. Caching operasi gagal
3. Retry saat online
4. Sinkronisasi data

## Penjelasan Detail Setiap Tahap
1. Offline Detection:
   ```typescript
   const [isOffline, setIsOffline] = useState(false);
   
   useEffect(() => {
     NetInfo.addEventListener(state => {
       setIsOffline(!state.isConnected);
     });
   }, []);
   ```

2. Retry Logic:
   ```typescript
   const handleRetry = async (operation) => {
     if (!isOffline) {
       await dispatch(retryOperation(operation));
     }
   };
   ```

## Komponen yang Terlibat
- NetInfo
- Redux offline storage
- Retry mechanisms
- Sync service

### Penjelasan useReducer dan useContext

Redux Toolkit digunakan dalam aplikasi ini untuk state management dengan beberapa keunggulan:

1. Simplified Setup:
   ```typescript
   const store = configureStore({
     reducer: {
       contacts: contactsReducer
     }
   });
   ```

2. Efficient Updates:
   ```typescript
   const contactsSlice = createSlice({
     name: 'contacts',
     initialState,
     reducers: {
       // Immutable updates dengan createSlice
       addContact: (state, action) => {
         state.contacts.push(action.payload);
       }
     }
   });
   ```

3. Built-in Thunks:
   ```typescript
   export const fetchContacts = createAsyncThunk(
     'contacts/fetchContacts',
     async (params) => {
       const response = await api.getContacts(params);
       return response.data;
     }
   );
   ```

4. DevTools Integration:
   - Automatic Redux DevTools setup
   - Action/State debugging
   - Time-travel debugging

5. Performance Optimizations:
   - Memoized selectors
   - Efficient updates
   - Batched state changes
