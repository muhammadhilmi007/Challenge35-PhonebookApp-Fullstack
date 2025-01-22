# Dokumentasi Alur Proses Aplikasi Phonebook

## Penjelasan Redux Toolkit

Redux Toolkit adalah library resmi untuk manajemen state dalam aplikasi React yang efisien. Ini menyederhanakan penggunaan Redux dengan mengurangi boilerplate code dan menyediakan best practices secara default.

### createSlice
`createSlice` adalah fungsi untuk membuat reducer, actions, dan state dalam satu tempat.

Contoh penggunaan:
```javascript
const contactSlice = createSlice({
  name: "contacts",
  initialState: {
    contacts: [],
    loading: false
  },
  reducers: {
    setContacts: (state, action) => {
      state.contacts = action.payload;
    }
  }
});
```

### createAsyncThunk
`createAsyncThunk` membantu menangani operasi asynchronous seperti API calls.

Contoh penggunaan:
```javascript
export const loadContacts = createAsyncThunk(
  "contacts/loadContacts",
  async () => {
    const response = await api.getContacts();
    return response.data;
  }
);
```

### configureStore
`configureStore` mengatur store Redux dengan konfigurasi default yang optimal.

Contoh penggunaan:
```javascript
const store = configureStore({
  reducer: {
    contacts: contactsReducer
  }
});
```

### Selector
Selector membantu mengambil dan memfilter data dari state Redux.

Contoh penggunaan:
```javascript
export const selectContacts = (state) => state.contacts.contacts;
```

## Alur Proses Detail

### 1. Proses `npm start` di React
1. Menjalankan perintah `npm start`
2. Webpack dev server diinisialisasi
3. Redux store dibuat dengan configureStore
4. Provider membungkus aplikasi dengan store
5. Aplikasi mulai dengan state awal yang kosong

### 2. Proses Menampilkan Halaman Main Page
1. Component MainPage dirender
2. useSelector mengambil data kontak dari store
3. useEffect memanggil action loadContacts
4. Loading state ditampilkan selama fetch data
5. Data kontak ditampilkan dalam tabel setelah berhasil diambil

### 3. Proses Add Contact
1. User mengisi form kontak baru
2. Validasi form dijalankan
3. addContact thunk dipanggil
4. Jika offline:
   - Contact disimpan di sessionStorage
   - Status "pending" ditambahkan
5. Jika online:
   - Contact dikirim ke server
   - Store diupdate dengan kontak baru

### 4. Proses Edit Contact
1. Data kontak dimuat ke form
2. User mengubah data
3. updateContact thunk dipanggil
4. State diperbarui dengan data terbaru
5. UI diupdate otomatis lewat selector

### 5. Proses Upload Avatar
1. User memilih file gambar
2. File divalidasi (ukuran/tipe)
3. updateAvatar thunk dipanggil
4. Progress upload ditampilkan
5. Avatar diperbarui setelah sukses

### 6. Proses Delete Contact
1. Konfirmasi penghapusan
2. deleteContact thunk dipanggil
3. Contact dihapus dari store
4. UI diupdate otomatis
5. Feedback diberikan ke user

### 7. Proses Search Contact
1. User mengetik kata kunci
2. setSearch action dipanggil
3. Selector memfilter kontak
4. Hasil search ditampilkan real-time
5. Pagination disesuaikan dengan hasil

### 8. Proses Search, Sort, dan Edit
1. Search dan sort bisa digabung
2. State diupdate untuk kedua kriteria
3. Selector menggabungkan filter
4. Hasil ditampilkan sesuai kriteria
5. Edit tetap berfungsi normal

### 9. Proses Edit Simultan
1. Optimistic update diterapkan
2. Conflict detection saat save
3. Error handling untuk konflik
4. Retry mechanism tersedia
5. UI selalu konsisten

### 10. Proses Search dan Sort
1. Kombinasi filter diterapkan
2. Sort diproses setelah search
3. Selector memastikan efisiensi
4. Pagination disesuaikan
5. Cache hasil untuk performa

### 11. Proses Search dan Add Contact
1. Search state dipertahankan
2. Add contact tidak reset search
3. New contact masuk ke filter
4. UI diupdate sesuai filter
5. Smooth transition antara views
