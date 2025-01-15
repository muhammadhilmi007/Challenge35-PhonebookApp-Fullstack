# Dokumentasi Alur Proses Aplikasi Phonebook

## Penjelasan useContext dan useReducer

### useContext
useContext adalah fitur React yang memungkinkan sharing state dan fungsi-fungsi antar komponen tanpa perlu prop drilling. Dalam aplikasi ini, ContactContext digunakan untuk mengelola state global terkait kontak seperti:
- Daftar kontak
- Status loading
- Pengaturan sorting
- State pencarian
- Pagination

### useReducer
useReducer adalah state management yang lebih kompleks dibanding useState, cocok untuk state yang memiliki logic kompleks. Dalam aplikasi ini digunakan untuk:
- Mengelola berbagai tipe aksi (ACTIONS) seperti SET_LOADING, SET_CONTACTS, dll
- Memisahkan logic state management ke dalam reducer terpisah
- Mempermudah testing dan maintenance

## Alur Proses Detail

### 1. Proses `npm start` di React
1. Command `npm start` dijalankan
2. Webpack dev server diinisialisasi
3. File index.js dimuat sebagai entry point
4. App.js dirender sebagai root component
5. ContactProvider membungkus aplikasi dan menginisialisasi state global
6. Halaman utama (MainPage) ditampilkan

### 2. Proses Menampilkan Halaman Main Page
1. MainPage component dirender
2. useContactContext hook dipanggil untuk mengakses state global
3. useEffect dijalankan untuk load data kontak awal
4. Reducer dispatch SET_LOADING
5. API call getContacts dilakukan
6. Data kontak disimpan ke state melalui SET_CONTACTS
7. Daftar kontak dirender dalam tabel

### 3. Proses Add Contact
1. User klik tombol "Add Contact"
2. Navigate ke halaman add contact form
3. User mengisi form data kontak
4. Saat klik "Save":
   - Form validation dijalankan
   - API call createContact dipanggil
   - Jika offline, data disimpan ke pending queue
   - Reducer update state kontak
   - Redirect ke halaman utama
   - Daftar kontak direfresh

### 4. Proses Edit Contact
1. User klik "Edit" pada kontak
2. Data kontak dimuat ke form edit
3. User modifikasi data
4. Saat klik "Save":
   - Validasi form
   - API call updateContact
   - State kontak diupdate via reducer
   - Kembali ke halaman utama dengan data terupdate

### 5. Proses Upload Avatar
1. User klik avatar kontak
2. File picker dibuka
3. User pilih file gambar
4. Validasi file (tipe, ukuran)
5. Upload gambar ke server
6. Update data kontak dengan avatar baru
7. Refresh tampilan dengan avatar baru

### 6. Proses Delete Contact
1. User klik "Delete"
2. Konfirmasi dialog ditampilkan
3. Jika user konfirmasi:
   - API call deleteContact
   - Reducer remove kontak dari state
   - UI diupdate tanpa kontak yang dihapus

### 7. Proses Search Contact
1. User ketik di search field
2. debounce function menunda eksekusi
3. Reducer update search query
4. API call dengan parameter search
5. Hasil search update state kontak
6. Tabel kontak dirender ulang

### 8. Proses Search, Sort, dan Edit
1. User input search keyword
2. User klik sort button
3. Reducer update search dan sort state
4. API call dengan parameter baru
5. Data diupdate sesuai search dan sort
6. Edit berfungsi normal pada hasil filtered

### 9. Proses Edit Simultan
1. Multiple user bisa edit kontak berbeda
2. Setiap edit menggunakan ID unik
3. Conflict detection saat save
4. Last-write-wins atau merge strategy
5. UI diupdate real-time

### 10. Proses Search dan Sort
1. User input search keyword
2. Sort state diupdate saat klik sort
3. Reducer combine search & sort params
4. Single API call dengan kedua parameter
5. Result dirender sesuai kriteria

### 11. Proses Search dan Add Contact
1. User melakukan pencarian
2. Hasil search ditampilkan
3. Klik "Add Contact":
   - State pencarian disimpan
   - Navigate ke form add
4. Klik "Cancel":
   - Kembali ke hasil pencarian sebelumnya
   - Restore search state