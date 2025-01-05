# 1. Proses `npm start` di React

## 1. Menjalankan Script Start

Script `start` didefinisikan dalam file `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start"
  }
}
```

## 2. Development Server

- Menjalankan `webpack-dev-server`.
- Membuka port 3000 (default).
- Mengaktifkan hot reloading untuk keperluan development.

## 3. Proses Build

- **Webpack**: Mengompilasi kode aplikasi.
- **Babel**: Mentransformasi JSX dan ES6+ ke dalam format yang didukung oleh browser.
- Memproses file CSS dan aset lainnya.

## 4. Entry Point

File `index.js` digunakan sebagai entry point aplikasi:
ReactDOM.render menginisialisasi aplikasi di <div id="root">;

```javascript
// filepath: src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
```

## 5. Struktur Komponen

Contoh struktur routing aplikasi dengan React Router, Component Tree Urutan render:

```javascript
// filepath: src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddContact />} />
        <Route path="/avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </Router>
  );
}
```

## 6. Fitur Development

- Hot reloading otomatis.
- Overlay untuk menampilkan error.
- Peringatan di console untuk membantu debugging.
- **Source maps**: Memudahkan debugging dengan menautkan kode asli ke dalam browser.

## 7. Browser

- Server development membuka browser secara otomatis.
- Aplikasi dapat diakses di `http://localhost:3000`.

## 8. Konfigurasi Proxy

Untuk meneruskan request API ke backend server, tambahkan konfigurasi proxy di file `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

> **Catatan:** Proxy digunakan untuk menghindari masalah CORS saat aplikasi front-end berkomunikasi dengan back-end.

# 2. Proses Menampilkan Halaman Main Page setelah npm start

Berikut adalah tahapan lengkap proses menampilkan halaman utama setelah menjalankan `npm start`:

1. **Inisialisasi Aplikasi (`frontend/src/index.js`)**

   ```javascript
   import React from "react";
   import ReactDOM from "react-dom/client";
   import App from "./App";
   import { BrowserRouter } from "react-router-dom";

   const root = ReactDOM.createRoot(document.getElementById("root"));
   root.render(
     <BrowserRouter>
       <App />
     </BrowserRouter>
   );
   ```

   - Aplikasi dimulai dari `index.js`
   - Menggunakan `BrowserRouter` untuk manajemen routing
   - Me-render komponen `App` sebagai root aplikasi

2. **Routing di App Component (`frontend/src/App.js`)**

   ```javascript
   import { Routes, Route } from "react-router-dom";
   import MainPage from "./components/MainPage";

   function App() {
     return (
       <Routes>
         <Route path="/" element={<MainPage />} />
         {/* routes lainnya */}
       </Routes>
     );
   }
   ```

   - Mendefinisikan rute untuk aplikasi
   - Rute "/" akan menampilkan komponen `MainPage`

3. **Inisialisasi MainPage (`frontend/src/components/MainPage.js`)**

   ```javascript
   const MainPage = () => {
     const navigate = useNavigate();
     const location = useLocation();

     const {
       contacts,
       loading,
       error,
       hasMore,
       search,
       setSearch,
       setSortBy,
       setSortOrder,
       loadMore,
       refreshContacts,
     } = useContacts();
   ```

   - Menggunakan hooks untuk navigasi dan lokasi
   - Mengambil state dan fungsi dari custom hook `useContacts`

4. **Manajemen State dengan useContacts (`frontend/src/hooks/useContacts.js`)**

   ```javascript
   const useContacts = () => {
     const [contacts, setContacts] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [page, setPage] = useState(1);
     const [hasMore, setHasMore] = useState(true);

     // State untuk pengurutan dan pencarian
     const [sortBy, setSortBy] = useState(() =>
       sessionStorage.getItem("contactSortBy") || "name"
     );
     const [search, setSearch] = useState(() => {
       const savedSearch = sessionStorage.getItem("contactSearch");
       return sessionStorage.getItem("searchActive") === "true" ? savedSearch : "";
     });
   ```

   - Menginisialisasi state untuk kontak, loading, dan error
   - Mengambil preferensi pengurutan dan pencarian dari sessionStorage

5. **Proses Loading Data**

   ```javascript
   const loadContacts = useCallback(
     async (loadMore = false) => {
       if (loading) return;
       setLoading(true);

       try {
         const { phonebooks, ...pagination } = await api.getContacts(
           loadMore ? page + 1 : 1,
           10,
           sortBy,
           sortOrder,
           search
         );

         if (Array.isArray(phonebooks)) {
           setContacts((prev) =>
             loadMore ? [...prev, ...phonebooks] : phonebooks
           );
           setHasMore(currentPage < pagination.pages);
           setPage(currentPage);
         }
       } catch (error) {
         setError(error);
       } finally {
         setLoading(false);
       }
     },
     [loading, page, sortBy, sortOrder, search]
   );
   ```

   - Mengambil data kontak dari API
   - Menangani pagination dan infinite scroll
   - Memperbarui state sesuai response

6. **Render Komponen UI**

   ```javascript
   return (
     <div className="app">
       <SearchBar
         value={search}
         onSearch={handleSearch}
         onAdd={handleAdd}
         onSort={handleSort}
       />
       <ContactList
         contacts={contacts}
         loading={loading}
         error={error}
         hasMore={hasMore}
         onLoadMore={loadMore}
         onEdit={handleEdit}
         onDelete={handleDelete}
         onAvatarUpdate={handleAvatarUpdate}
       />
       {loading && <p>Loading...</p>}
     </div>
   );
   ```

   - Menampilkan SearchBar untuk pencarian dan pengurutan
   - Menampilkan ContactList dengan data kontak
   - Menampilkan indikator loading saat memuat data

7. **Alur Proses Lengkap**

   - Saat aplikasi dimulai:

     1. `index.js` me-render `App` component
     2. `App` merutekan ke `MainPage` untuk path "/"
     3. `MainPage` diinisialisasi dan memanggil `useContacts`
     4. `useContacts` memuat data awal dari API
     5. UI dirender dengan data yang diterima

   - Fitur yang tersedia:

     1. Pencarian kontak secara real-time
     2. Pengurutan berdasarkan nama atau nomor
     3. Infinite scroll untuk memuat lebih banyak kontak
     4. Edit dan hapus kontak
     5. Update avatar kontak

   - State Management:

     1. State lokal untuk UI components
     2. Custom hook untuk logika bisnis
     3. SessionStorage untuk persistensi preferensi user

   - Komunikasi dengan backend melalui API calls:

     1. `api.getContacts` untuk memuat data kontak
     2. `api.editContact` untuk menyimpan perubahan kontak
     3. `api.deleteContact` untuk menghapus kontak

   - Error handling:

     1. Menangani kesalahan saat memuat data
     2. Menangani kesalahan saat menyimpan perubahan kontak
     3. Menangani kesalahan saat menghapus kontak

   - Routing:

     1. Menggunakan React Router untuk navigasi antar halaman

   - Optimasi Performa:

     1. Implementasi infinite scroll untuk memuat kontak secara bertahap
     2. Pencarian dan pengurutan dilakukan secara lokal untuk UX yang lebih responsif

   - Alur Aplikasi:

     1. Aplikasi dimulai dengan merender komponen App
     2. Pengguna diarahkan ke halaman utama (MainPage) yang menampilkan daftar kontak
     3. Pengguna dapat melakukan pencarian, pengurutan, atau scroll untuk memuat lebih banyak kontak
     4. Untuk menambah kontak baru, pengguna diarahkan ke halaman AddContact
     5. Untuk mengedit atau menghapus kontak, pengguna dapat melakukannya langsung dari daftar kontak
     6. Untuk memperbarui avatar, pengguna diarahkan ke halaman AvatarUpload

   - Komponen UI:

     1. SearchBar: Input pencarian dan tombol pencarian
     2. ContactList: Daftar kontak yang dapat di-edit, dihapus, dan memperbarui avatar kontak
     3. ContactCard: Card kontak yang dapat di-edit, dihapus, dan memperbarui avatar kontak
     4. AvatarUpload: Form untuk memperbarui avatar kontak

   - Manajemen State:

     1. State lokal di-sync dengan data dari backend melalui API calls
     2. Perubahan pada frontend (seperti edit atau hapus) langsung dikirim ke backend

   - Alur Proses Keseluruhan:

     1. Pencarian:
     1. User mengetik keyword di search field
     1. `handleSearchChange` dipanggil setiap perubahan input
     1. State pencarian diperbarui di useContacts
     1. Data diambil dari API dengan parameter pencarian
     1. Hasil ditampilkan di daftar kontak

     1. Pengurutan:
     1. User memilih opsi pengurutan
     1. `handleSortChange` dipanggil setiap perubahan input
     1. State pengurutan diperbarui di useContacts
     1. Data diambil dari API dengan parameter pengurutan
     1. Hasil ditampilkan di daftar kontak

     1. Infinite Scroll:
     1. User melakukan scroll ke bawah
     1. `handleScroll` dipanggil saat user melakukan scroll
     1. `loadMore` dipanggil untuk memuat kontak berikutnya
     1. Data diambil dari API dengan parameter halaman
     1. Hasil ditampilkan di daftar kontak

     1. Menambah Kontak:
     1. User menekan tombol "Add Contact"
     1. `handleAdd` dipanggil untuk navigasi ke halaman AddContact
     1. Komponen AddContact ditampilkan
     1. User mengisi form dan menekan tombol "Save"
     1. `handleSubmit` dipanggil untuk menyimpan kontak baru
     1. Data dikirim ke API untuk disimpan
     1. Hasil ditampilkan di daftar kontak

     1. Mengedit Kontak:
     1. User menekan tombol "Edit" pada kontak
     1. `handleEdit` dipanggil untuk navigasi ke halaman EditContact
     1. Komponen EditContact ditampilkan
     1. User mengisi form dan menekan tombol "Save"
     1. `handleSubmit` dipanggil untuk menyimpan perubahan kontak
     1. Data dikirim ke API untuk disimpan
     1. Hasil ditampilkan di daftar kontak

     1. Menghapus Kontak:
     1. User menekan tombol "Delete" pada kontak
     1. `handleDelete` dipanggil untuk menghapus kontak
     1. Data dikirim ke API untuk dihapus
     1. Hasil ditampilkan di daftar kontak

     1. Memperbarui Avatar Kontak:
     1. User menekan tombol "Update Avatar" pada kontak
     1. `handleAvatarUpdate` dipanggil untuk navigasi ke halaman AvatarUpload
     1. Komponen AvatarUpload ditampilkan
     1. User mengisi form dan menekan tombol "Save"
     1. `handleSubmit` dipanggil untuk menyimpan perubahan avatar kontak
     1. Data dikirim ke API untuk disimpan
     1. Hasil ditampilkan di daftar kontak

     1. Error Handling:
     1. Kesalahan saat memuat data
     1. Kesalahan saat menyimpan perubahan kontak
     1. Kesalahan saat menghapus kontak
     1. Kesalahan saat memperbarui avatar kontak

     1. Routing:
     1. Pengguna diarahkan ke halaman utama
     1. Pengguna diarahkan ke halaman AddContact
     1. Pengguna diarahkan ke halaman EditContact
     1. Pengguna diarahkan ke halaman AvatarUpload

     1. Optimasi Performa:
     1. Implementasi infinite scroll untuk memuat kontak secara bertahap
     1. Pencarian dan pengurutan dilakukan secara lokal untuk UX yang lebih responsif

     1. Penjelasan Fungsi:
     1. `useContacts` untuk memuat data kontak
     1. `handleSearchChange` untuk mengubah pencarian
     1. `handleSortChange` untuk mengubah pengurutan
     1. `handleScroll` untuk memuat kontak berikutnya
     1. `handleAdd` untuk navigasi ke halaman AddContact
     1. `handleEdit` untuk navigasi ke halaman EditContact
     1. `handleDelete` untuk menghapus kontak
     1. `handleAvatarUpdate` untuk navigasi ke halaman AvatarUpload

     1. Penjelasan Komponen:
     1. SearchBar: Input pencarian dan tombol pencarian
     1. ContactList: Daftar kontak yang dapat di-edit, dihapus, dan memperbarui avatar kontak
     1. ContactCard: Card kontak yang dapat di-edit, dihapus, dan memperbarui avatar kontak
     1. AvatarUpload: Form untuk memperbarui avatar kontak

     1. Penjelasan fungsi pada React JS:
     1. useEffect: Menggunakan useEffect untuk memuat data kontak
     1. useState: Menggunakan useState untuk mengelola state
     1. useMemo: Menggunakan useMemo untuk menyimpan data kontak
     1. useCallback: Menggunakan useCallback untuk menyimpan fungsi
     1. useSessionStorage: Menggunakan useSessionStorage untuk menyimpan preferensi pengguna
     1. useNavigate: Menggunakan useNavigate untuk navigasi antar halaman
     1. useInfiniteScroll: Menggunakan useInfiniteScroll untuk memuat kontak secara bertahap
     1. useSearch: Menggunakan useSearch untuk pencarian
     1. useSort: Menggunakan useSort untuk pengurutan
     1. useDebounce: Menggunakan useDebounce untuk debouncing pencarian
     1. useScroll: Menggunakan useScroll untuk memuat kontak berikutnya
     1. useAvatar: Menggunakan useAvatar untuk mengunggah avatar kontak

# 3. Proses Menampilkan Halaman Add Contact dari mulai user mengklik button "Add Contact" pada halaman utama

Proses menampilkan halaman Add Contact terjadi dalam beberapa tahap:

1. **Komponen MainPage (`frontend/src/components/MainPage.js`)**

   - Pada halaman utama, terdapat tombol "Add Contact" yang ketika diklik akan menggunakan fungsi `navigate` dari React Router
   - Fungsi `navigate` akan mengarahkan pengguna ke halaman `/add`

2. **Komponen AddContact (`frontend/src/components/AddContact.js`)**
   - Ketika pengguna diarahkan ke `/add`, React Router akan merender komponen AddContact
   - Komponen ini menginisialisasi state menggunakan useState:
     - `form`: menyimpan data nama dan nomor telepon
     - `error`: menyimpan pesan error jika ada
     - `isSubmitting`: menandakan proses submit sedang berlangsung
3. **Form Input**

   - Form memiliki dua input field:
     - Input untuk nama kontak
     - Input untuk nomor telepon
   - Setiap perubahan pada input field akan mengupdate state `form` melalui fungsi `handleChange`

4. **Tombol Aksi**
   - Terdapat dua tombol:
     - "Save": untuk menyimpan kontak baru
     - "Cancel": untuk membatalkan dan kembali ke halaman utama
   - Saat tombol Cancel diklik, fungsi `handleCancel` akan dipanggil untuk kembali ke halaman utama
   - Saat form disubmit, fungsi `handleSubmit` akan:
     - Memvalidasi input (tidak boleh kosong)
     - Mengirim data ke server melalui props `onAdd`
     - Menampilkan error jika ada masalah
     - Redirect ke halaman utama jika berhasil

# 4. Proses Fitur Edit Contact dari mulai user mengklik button "Edit Contact" pada halaman utama

Proses fitur Edit Contact terdiri dari beberapa tahapan:

1. **Komponen ContactCard (`frontend/src/components/ContactCard.js`)**

   - Setiap kontak ditampilkan dalam bentuk card yang memiliki tombol "Edit"
   - Ketika tombol "Edit" diklik:
     - State `isEditing` diubah menjadi `true`
     - Form edit akan muncul dengan data kontak yang sudah ada
     - Data awal disimpan dalam state `form` menggunakan `useState`

2. **Proses Edit Data**

   - Form edit memiliki dua input field:
     - Input nama kontak (terisi dengan data sebelumnya)
     - Input nomor telepon (terisi dengan data sebelumnya)
   - Setiap perubahan pada input field akan mengupdate state `form` melalui fungsi `handleChange`
   - Validasi input dilakukan saat user menyimpan perubahan:
     - Nama dan nomor telepon tidak boleh kosong
     - Jika kosong, akan menampilkan pesan error

3. **Proses Penyimpanan**

   - Saat user mengklik tombol "Save":
     - Fungsi `handleSave` dipanggil
     - Data dikirim ke server melalui API menggunakan fungsi `onEdit`
     - Jika berhasil:
       - State `isEditing` diubah menjadi `false`
       - Card kembali ke mode tampilan normal
       - Data yang ditampilkan sudah terupdate
     - Jika gagal:
       - Error ditampilkan di console
       - User tetap dalam mode edit

4. **Pembatalan Edit**
   - User dapat membatalkan proses edit dengan mengklik tombol "Cancel"
   - Saat dibatalkan:
     - State `isEditing` diubah menjadi `false`
     - Form edit ditutup
     - Data kembali ke kondisi sebelum diedit

# 5. Proses Fitur Upload Avatar dari mulai user mengklik gambar avatar pada halaman utama

Proses fitur Upload Avatar terdiri dari beberapa tahapan:

1. **Inisiasi Upload Avatar (`frontend/src/components/ContactCard.js`)**

   - User mengklik gambar avatar pada card kontak
   - Fungsi `handleAvatarClick` dipanggil
   - Navigasi ke halaman upload avatar dengan ID kontak tertentu

2. **Komponen AvatarUpload (`frontend/src/components/AvatarUpload.js`)**

   - Komponen ini menginisialisasi beberapa state:
     - `preview`: untuk menampilkan preview gambar yang akan diupload
     - `currentAvatar`: menyimpan avatar yang sedang digunakan
     - `uploading`: status proses upload
     - `error`: menyimpan pesan error jika ada
   - Saat komponen dimuat:
     - Mengambil ID kontak dari parameter URL
     - Mengambil data avatar saat ini dari server

3. **Proses Upload File**

   - User dapat memilih file dengan beberapa cara:
     - Mengklik area upload untuk membuka dialog pemilihan file `openFileDialog` dan memilih file manually `handleFileInput`
     - Melakukan drag and drop file ke area upload `handleFileDrop`
     - Mengambil foto langsung dari kamera (khusus perangkat mobile) `handleCapture`
   - Validasi file yang dipilih:
     - Tipe file harus JPG atau PNG
     - Ukuran file tidak boleh lebih dari 2MB
   - Setelah file valid:
     - File dibaca menggunakan FileReader untuk membaca konten file sebagai base64 encoded string `handleFileSelect`
     - Preview gambar ditampilkan menggunakan base64 encoded string
     - State `error` dikosongkan
   - Penanganan Drag and Drop:
     - Event `dragOver` menampilkan efek visual saat file di-drag
     - Event `dragLeave` menghilangkan efek visual saat file keluar area
     - Event `drop` menangkap file dan memprosesnya menggunakan `handleFileSelect`

4. **Proses Penyimpanan Avatar**

   - Saat user mengklik tombol "Upload":
     - State `uploading` diubah menjadi `true`
     - File dikonversi ke FormData menggunakan `formData.append` dan `blob`
     - Data dikirim ke server menggunakan API
     - Jika berhasil:
       - Avatar kontak diperbarui
       - User diarahkan kembali ke halaman utama
     - Jika gagal:
       - Pesan error ditampilkan
       - State `uploading` diubah menjadi `false`

5. **Pembatalan Upload**
   - User dapat membatalkan proses dengan mengklik tombol "Cancel"
   - Saat dibatalkan:
     - Preview dihapus
     - User diarahkan kembali ke halaman utama
     - Tidak ada perubahan pada avatar kontak

# 6. Proses Fitur Delete Contact dari mulai user mengklik button "Delete Contact" pada halaman utama

Proses fitur Delete Contact terdiri dari beberapa tahapan:

1. **Inisiasi Proses Delete (`frontend/src/components/ContactCard.js`)**

   - Setiap card kontak memiliki tombol "Delete"
   - Saat tombol "Delete" diklik:
     - Fungsi `handleDelete` dipanggil
     - State `showConfirm` diubah menjadi `true`
     - Dialog konfirmasi penghapusan ditampilkan

2. **Dialog Konfirmasi**

   - Dialog konfirmasi muncul dengan dua pilihan:
     - "Yes": untuk melanjutkan penghapusan
     - "No": untuk membatalkan penghapusan
   - Jika user memilih "No":
     - State `showConfirm` diubah menjadi `false`
     - Dialog konfirmasi ditutup
     - Tidak ada perubahan pada data kontak

3. **Proses Penghapusan (`frontend/src/components/ContactCard.js`)**

   - Jika user memilih "Yes":
     - Fungsi `confirmDelete` dipanggil
     - Fungsi ini melakukan:
       - Memanggil fungsi `onDelete` dengan parameter `contact.id`
       - Mengirim request delete ke API
       - Menutup dialog konfirmasi dengan mengubah `showConfirm` menjadi `false`

4. **Penanganan di MainPage (`frontend/src/components/MainPage.js**)\*\*

   - Fungsi `handleDelete` dipanggil dengan parameter ID kontak:
     ```javascript
     const handleDelete = async (id) => {
       try {
         await api.deleteContact(id);
         const updatedContacts = contacts.filter(
           (contact) => contact.id !== id
         );
         refreshContacts(updatedContacts);
         setContacts(updatedContacts);
       } catch (error) {
         console.log("Error deleting contact: ", error);
       }
     };
     ```
   - Setelah penghapusan berhasil:
     - Data kontak difilter untuk menghapus kontak dengan ID yang dihapus
     - Fungsi `refreshContacts` dipanggil untuk memperbarui tampilan
     - State kontak diperbarui dengan `setContacts`
   - Jika terjadi error:
     - Error dicatat di console
     - State kontak tidak berubah

5. **Integrasi dengan API (`frontend/src/services/api.js**)\*\*
   - Implementasi fungsi `deleteContact` di API service:
     ```javascript
     deleteContact: async (id) => {
       try {
         const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
         console.log(response.data);
         return response.data;
       } catch (error) {
         console.log("Error deleting contact: ", error);
         throw error;
       }
     };
     ```
   - Proses yang terjadi:
     - Request DELETE dikirim ke endpoint `/phonebooks/${id}`
     - Response dari server dilog ke console
     - Jika berhasil, response data dikembalikan
     - Jika gagal, error dilempar untuk ditangani di komponen

# 7. Proses Fitur Search Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama

Proses fitur Search Contact terdiri dari beberapa tahapan:

1. **Komponen SearchBar (`frontend/src/components/SearchBar.js`)**

   - Input field search memiliki event handler `handleSearchChange`:
     ```javascript
     const handleSearchChange = (e) => {
       const newSearch = e.target.value;
       onSearch(newSearch);
     };
     ```
   - Setiap perubahan pada input field:
     - Nilai input baru diambil dari `e.target.value`
     - Fungsi `onSearch` dipanggil dengan nilai baru

2. **Penanganan di MainPage (`frontend/src/components/MainPage.js**)\*\*

   - Fungsi `handleSearch` menangani pencarian:
     ```javascript
     const handleSearch = (value) => {
       setSearch(value);
       if (value === "") {
         sessionStorage.removeItem("contactSearch");
       } else {
         sessionStorage.setItem("contactSearch", value);
         sessionStorage.removeItem("searchActive", "true");
       }
     };
     ```
   - Proses yang terjadi:
     - Nilai pencarian disimpan ke state dengan `setSearch`
     - Jika nilai kosong, hapus dari sessionStorage
     - Jika ada nilai, simpan ke sessionStorage

3. **Custom Hook useContacts (`frontend/src/hooks/useContacts.js`)**

   - Hook ini mengelola state dan logika pencarian:

     ```javascript
     const [search, setSearch] = useState(() => {
       const savedSearch = sessionStorage.getItem("contactSearch");
       const isActive = sessionStorage.getItem("searchActive");
       return isActive === "true" ? savedSearch : "";
     });

     const handleSearch = useCallback((value) => {
       setSearch(value);
       if (value === "") {
         sessionStorage.removeItem("contactSearch");
       } else {
         sessionStorage.setItem("contactSearch", value);
         sessionStorage.removeItem("searchActive", "true");
       }
     }, []);

     useEffect(() => {
       sessionStorage.setItem("contactSearch", search);
       const fetchData = async () => {
         setContacts([]);
         setPage(1);
         setHasMore(true);
         await loadContacts(false);
       };
       fetchData();
     }, [search, sortBy, sortOrder]);
     ```

   - State dan fungsi yang dikelola:
     - `search`: Menyimpan nilai keyword pencarian
     - `handleSearch`: Menangani perubahan nilai pencarian
     - `useEffect`: Memicu pencarian saat nilai search berubah

4. **Integrasi dengan API (`frontend/src/services/api.js**)\*\*

   - Implementasi fungsi `getContacts` di API service:
     ```javascript
     getContacts: async (
       page = 1,
       limit = 5,
       sortBy = "name",
       sortOrder = "asc",
       search = ""
     ) => {
       try {
         const response = await axios.get(`${API_URL}/phonebooks`, {
           params: { page, limit, sortBy, sortOrder, name: search },
         });
         return response.data;
       } catch (error) {
         console.log("Error getting contacts: ", error);
         throw error;
       }
     };
     ```
   - Parameter pencarian dikirim sebagai query parameter
   - Response dari server berisi daftar kontak yang sesuai dengan keyword pencarian

5. **Alur Proses Keseluruhan**

   - Pencarian:

     1. User mengetik keyword di search field
     2. `handleSearchChange` dipanggil setiap perubahan input
     3. State pencarian diperbarui di useContacts
     4. Data diambil dari API dengan parameter pencarian
     5. Hasil ditampilkan di daftar kontak

   - Pengurutan:

     1. User mengklik tombol sort
     2. `handleSort` mengubah urutan (asc/desc)
     3. State pengurutan diperbarui
     4. Data diambil ulang dengan urutan baru
     5. Daftar kontak diperbarui

   - Edit Contact:
     1. User mengklik tombol edit
     2. Form edit ditampilkan dengan data kontak
     3. Setelah edit, data dikirim ke API
     4. Daftar kontak diperbarui sesuai hasil edit
     5. Tampilan disesuaikan dengan filter pencarian aktif

# 8. Proses Fitur Search, Sorting, dan Edit Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama dan mengklik sort button dan juga mengklik tombol edit pada halaman utama

Proses ini terdiri dari beberapa bagian utama:

1. **Fitur Search dan Sorting di SearchBar (`frontend/src/components/SearchBar.js`)**

   ```javascript
   const SearchBar = ({ value = "", onSearch, onSort, onAdd }) => {
     const [sortOrder, setSortOrder] = useState(() => {
       return sessionStorage.getItem("sortOrder") || "asc";
     });

     const handleSort = () => {
       const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
       setSortOrder(newSortOrder);
       sessionStorage.setItem("sortOrder", newSortOrder);
       onSort("name", newSortOrder);
     };

     const handleSearchChange = (e) => {
       const newSearch = e.target.value;
       onSearch(newSearch);
     };
   ```

   - Komponen mengelola:
     - Input pencarian dengan `handleSearchChange`
     - Tombol pengurutan dengan `handleSort`
     - Menyimpan state pengurutan di sessionStorage

2. **Penanganan State di useContacts (`frontend/src/hooks/useContacts.js`)**

   ```javascript
   const handleSort = useCallback((sortBy, sortOrder) => {
     sessionStorage.setItem("contactSortBy", sortBy);
     sessionStorage.setItem("contactSortOrder", sortOrder);
     setPage(1);
     setContacts([]);
     setSortBy(sortBy);
     setSortOrder(sortOrder);
   }, []);

   const loadContacts = useCallback(
     async (loadMore = false) => {
       if (loading) return;
       setLoading(true);
       setError(null);

       try {
         const currentPage = loadMore ? page + 1 : 1;
         const { phonebooks, ...pagination } = await api.getContacts(
           currentPage,
           10,
           sortBy,
           sortOrder,
           search
         );

         if (Array.isArray(phonebooks)) {
           if (loadMore) {
             setContacts((prev) => {
               const existingIds = new Set(prev.map((contact) => contact.id));
               const newContacts = phonebooks.filter(
                 (contact) => !existingIds.has(contact.id)
               );
               return [...prev, ...newContacts];
             });
           } else {
             setContacts(phonebooks);
           }
           setHasMore(currentPage < pagination.pages);
           setPage(currentPage);
         }
       } catch (error) {
         setError(error);
       } finally {
         setLoading(false);
       }
     },
     [search, sortBy, sortOrder, loading, page]
   );
   ```

   - Mengelola state untuk:
     - Pencarian dengan `search`
     - Pengurutan dengan `sortBy` dan `sortOrder`
     - Memuat data dengan `loadContacts`

3. **Fitur Edit Contact di MainPage (`frontend/src/components/MainPage.js`)**

   ```javascript
   const handleEdit = async (id, updatedContact) => {
     try {
       await api.updateContact(id, updatedContact);

       if (search) {
         const searchLower = search.toLowerCase();
         const isStillMatching =
           updatedContact.name.toLowerCase().includes(searchLower) ||
           updatedContact.phone.toLowerCase().includes(searchLower);

         if (!isStillMatching) {
           const updatedContacts = contacts.filter(
             (contact) => contact.id !== id
           );
           setContacts(updatedContacts);
           return;
         }
       }

       const updatedContacts = contacts.map((contact) =>
         contact.id === id ? updatedContact : contact
       );
       refreshContacts(updatedContacts);
       setContacts(updatedContacts);
     } catch (error) {
       console.log("Error updating contact: ", error);
     }
   };
   ```

   - Proses edit meliputi:
     - Update data kontak melalui API
     - Pengecekan apakah hasil edit masih sesuai filter pencarian
     - Pembaruan tampilan daftar kontak

4. **Integrasi dengan API (`frontend/src/services/api.js**)\*\*

   ```javascript
   export const api = {
     getContacts: async (
       page = 1,
       limit = 5,
       sortBy = "name",
       sortOrder = "asc",
       search = ""
     ) => {
       try {
         const response = await axios.get(`${API_URL}/phonebooks`, {
           params: { page, limit, sortBy, sortOrder, name: search },
         });
         return response.data;
       } catch (error) {
         console.log("Error getting contacts: ", error);
         throw error;
       }
     },

     updateContact: async (id, contact) => {
       try {
         const response = await axios.put(
           `${API_URL}/phonebooks/${id}`,
           contact
         );
         return response.data;
       } catch (error) {
         console.log("Error updating contact: ", error);
         throw error;
       }
     },
   };
   ```

   - API menyediakan endpoint untuk:
     - Mengambil data dengan parameter pencarian dan pengurutan
     - Mengupdate data kontak yang diedit

5. **Alur Proses Keseluruhan**

   - Pencarian:

     1. User mengetik keyword di search field
     2. `handleSearchChange` dipanggil setiap perubahan input
     3. State pencarian diperbarui di useContacts
     4. Data diambil dari API dengan parameter pencarian
     5. Hasil ditampilkan di daftar kontak

   - Pengurutan:

     1. User mengklik tombol sort
     2. `handleSort` mengubah urutan (asc/desc)
     3. State pengurutan diperbarui
     4. Data diambil ulang dengan urutan baru
     5. Daftar kontak diperbarui

   - Edit Contact:
     1. User mengklik tombol edit
     2. Form edit ditampilkan dengan data kontak
     3. Setelah edit, data dikirim ke API
     4. Daftar kontak diperbarui sesuai hasil edit
     5. Tampilan disesuaikan dengan filter pencarian aktif

# 9. Proses Fitur Edit Contact dapat dilakukan perubahaan secara bersamaan di halaman utama

Fitur Edit Contact memungkinkan pengguna untuk mengedit beberapa kontak secara bersamaan di halaman utama. Berikut adalah penjelasan detailnya:

1. **Komponen ContactCard (`frontend/src/components/ContactCard.js`)**

   ```javascript
   const ContactCard = ({ contact, onEdit, onDelete, onAvatarUpdate }) => {
     const [isEditing, setIsEditing] = useState(false);
     const [form, setForm] = useState({
       name: contact.name,
       phone: contact.phone,
     });

     const handleSave = async () => {
       try {
         await onEdit(contact.id, form);
         setIsEditing(false);
       } catch (error) {
         console.log("Error Updating Contact", error);
       }
     };

     const handleChange = (e) => {
       const { name, value } = e.target;
       setForm((prev) => ({
         ...prev,
         [name]: value,
       }));
     };
   };
   ```

   - Setiap card kontak memiliki:
     - State `isEditing` untuk mode edit
     - State `form` untuk data yang sedang diedit
     - Fungsi `handleSave` untuk menyimpan perubahan
     - Fungsi `handleChange` untuk update form

2. **Penanganan State Lokal**

   - Setiap card mengelola state editingnya sendiri:
     ```javascript
     return (
       <div className="contact-card">
         {isEditing ? (
           <div className="edit-form">
             <input
               type="text"
               name="name"
               value={form.name}
               onChange={handleChange}
               className="edit-input"
               placeholder="Name"
             />
             <input
               type="text"
               name="phone"
               value={form.phone}
               onChange={handleChange}
               className="edit-input"
               placeholder="Phone"
             />
             <div className="edit-buttons">
               <button onClick={handleSave}>Save</button>
               <button onClick={() => setIsEditing(false)}>Cancel</button>
             </div>
           </div>
         ) : (
           // Tampilan normal kontak
         )}
       </div>
     );
     ```
   - Keuntungan pendekatan ini:
     - Setiap kontak dapat diedit independen
     - Tidak mempengaruhi state kontak lain
     - UI tetap responsif saat mengedit

3. **Penanganan di MainPage**

   ```javascript
   const handleEdit = async (id, updatedContact) => {
     try {
       await api.updateContact(id, updatedContact);

       if (search) {
         const searchLower = search.toLowerCase();
         const isStillMatching =
           updatedContact.name.toLowerCase().includes(searchLower) ||
           updatedContact.phone.toLowerCase().includes(searchLower);

         if (!isStillMatching) {
           const updatedContacts = contacts.filter(
             (contact) => contact.id !== id
           );
           setContacts(updatedContacts);
           return;
         }
       }

       const updatedContacts = contacts.map((contact) =>
         contact.id === id ? updatedContact : contact
       );
       refreshContacts(updatedContacts);
       setContacts(updatedContacts);
     } catch (error) {
       console.log("Error updating contact: ", error);
     }
   };
   ```

   - Fungsi ini menangani:
     - Update data ke API
     - Pengecekan filter pencarian
     - Pembaruan state global kontak
     - Penanganan error

4. **Alur Proses Edit Bersamaan**

   - User dapat:
     1. Mengklik tombol edit di beberapa kontak
     2. Mengedit data di form yang muncul
     3. Menyimpan perubahan secara independen
     4. Membatalkan edit tanpa mempengaruhi kontak lain
   - Sistem akan:
     1. Mengelola state edit untuk setiap kontak
     2. Menyimpan perubahan ke API satu per satu
     3. Memperbarui tampilan sesuai hasil edit
     4. Menangani error untuk setiap operasi edit

5. **Keunggulan Implementasi**
   - Multi-edit: Beberapa kontak dapat diedit bersamaan
   - Independen: Perubahan satu kontak tidak mempengaruhi yang lain
   - Responsif: UI tetap lancar saat mengedit banyak kontak
   - Konsisten: State global tetap terjaga untuk semua kontak

# 10. Proses Fitur searching dan sorting
