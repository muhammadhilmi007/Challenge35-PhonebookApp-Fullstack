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
   import "./index.css";
   import App from "./App";
   import reportWebVitals from "./reportWebVitals";

   const root = ReactDOM.createRoot(document.getElementById("root"));
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );

   reportWebVitals();
   ```

   - Aplikasi dimulai dari `index.js`
   - Mengimpor stylesheet global `index.css`
   - Me-render komponen `App` sebagai root aplikasi dalam `React.StrictMode`
   - Menggunakan `createRoot` untuk rendering yang lebih efisien
   - Memanggil `reportWebVitals()` untuk mengukur performa aplikasi

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

   - Mendefinisikan rute untuk aplikasi dengan React Router
   - Rute "/" akan menampilkan komponen `MainPage`

3. **Inisialisasi MainPage (`frontend/src/components/MainPage.js`)**

   ```javascript
   /**
    * Komponen MainPage yang menampilkan daftar kontak.
    * Menggunakan hook useNavigate dan useLocation untuk navigasi dan lokasi.
    * Menggunakan custom hook useContacts untuk mengelola state dan logika kontak.
    *
    * @returns Komponen MainPage
    */
   const MainPage = () => {
     const navigate = useNavigate(); // Menggunakan useNavigate dari react-router-dom untuk navigasi antar halaman
     const location = useLocation(); // Menggunakan useLocation dari react-router-dom untuk mengakses informasi lokasi

     const { // Menggunakan destructuring untuk mengakses state dan fungsi dari useContacts
       contacts, // State untuk daftar kontak
       loading, // State untuk menampilkan loading indicator
       error, // State untuk menampilkan pesan error
       hasMore, // State untuk menampilkan tombol "Load More"
       search, // State untuk pencarian
       setSearch, // Fungsi untuk menangani pencarian
       setSortBy, // Fungsi untuk menangani pengurutan
       setSortOrder, // Fungsi untuk menangani pengurutan
       loadMore, // Fungsi untuk menangani tombol "Load More"
       refreshContacts, // Fungsi untuk memuat ulang data kontak
     } = useContacts(); // Menggunakan useContacts untuk mengelola state kontak dan fungsi untuk memuat data kontak
   ```

   - Menggunakan hooks untuk navigasi dan lokasi
   - Mengambil state dan fungsi dari custom hook `useContacts`

4. **Manajemen State dengan useContacts (`frontend/src/hooks/useContacts.js`)**

   ```javascript
   // Custom hook untuk mengelola state dan logika kontak
   const useContacts = () => {
     // State untuk menyimpan daftar kontak
     const [contacts, setContacts] = useState([]);
     // State untuk menandai proses loading
     const [loading, setLoading] = useState(false);
     // State untuk menyimpan pesan error
     const [error, setError] = useState(null);
     // State untuk menyimpan nomor halaman saat ini
     const [page, setPage] = useState(1);
     // State untuk menandai apakah masih ada data yang bisa dimuat
     const [hasMore, setHasMore] = useState(true);

     // State untuk pengurutan dan pencarian
     // Mengambil nilai pengurutan dari sessionStorage atau default ke "name"
     const [sortBy, setSortBy] = useState(
       () => sessionStorage.getItem("contactSortBy") || "name"
     );
     // Mengambil nilai pencarian dari sessionStorage jika pencarian aktif
     // Inisialisasi state untuk pencarian
     const [search, setSearch] = useState(() => {
       // Mengambil nilai pencarian yang tersimpan dari sessionStorage
       const savedSearch = sessionStorage.getItem("contactSearch");
       // Mengembalikan nilai savedSearch jika searchActive adalah "true", jika tidak, mengembalikan string kosong
       return sessionStorage.getItem("searchActive") === "true"
         ? savedSearch
         : "";
     });
   };
   ```

   - Menginisialisasi state untuk kontak, loading, dan error
   - Mengambil preferensi pengurutan dan pencarian dari sessionStorage

5. **Proses Loading Data**

   ```javascript
   // Fungsi untuk memuat kontak dari API
   const loadContacts = useCallback(
     async (loadMore = false) => {
       // Jika sedang loading, hentikan eksekusi
       if (loading) return;
       // Set status loading menjadi true
       setLoading(true);

       try {
         // Panggil API untuk mendapatkan kontak
         const { phonebooks, ...pagination } = await api.getContacts(
           loadMore ? page + 1 : 1, // Jika loadMore, ambil halaman berikutnya, jika tidak, halaman pertama (Operator ternary)
           10, // Jumlah item per halaman
           sortBy, // Kriteria pengurutan
           sortOrder, // Urutan (asc/desc)
           search // Kata kunci pencarian
         );

         // Jika phonebooks adalah array
         if (Array.isArray(phonebooks)) {
           // Update state contacts
           setContacts((prev) =>
             loadMore ? [...prev, ...phonebooks] : phonebooks
           ); // Operator ternary untuk menangani loadMore atau tidak loadMore (Operator ternary)
           // Set hasMore berdasarkan jumlah halaman
           setHasMore(currentPage < pagination.pages);
           // Update nomor halaman saat ini
           setPage(currentPage);
         }
       } catch (error) {
         // Jika terjadi error, set state error
         setError(error);
       } finally {
         // Setelah selesai, set loading menjadi false
         setLoading(false);
       }
     },
     [loading, page, sortBy, sortOrder, search]
   ); // Dependencies untuk useCallback
   ```

   - Mengambil data kontak dari API
   - Menangani pagination dan infinite scroll
   - Memperbarui state sesuai response
   - Kode ini menggunakan operator ternary untuk memeriksa kondisi dari variabel loadMore.
     Jika loadMore bernilai true, artinya pengguna ingin memuat lebih banyak kontak (misalnya, saat menggulir ke bawah), maka kode akan menggabungkan kontak yang sudah ada (prev) dengan kontak baru yang diambil dari API (phonebooks). Ini dilakukan dengan sintaksis [...prev, ...phonebooks], yang berarti membuat array baru yang terdiri dari semua kontak sebelumnya diikuti oleh kontak baru.
     Jika loadMore bernilai false, maka state contacts akan diatur menjadi phonebooks, yang berarti hanya menampilkan kontak baru yang diambil dari API tanpa menambahkan kontak yang sudah ada.

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

Proses menampilkan halaman Add Contact terdiri dari beberapa tahapan:

1. **Inisiasi Add Contact (`frontend/src/components/AddContact.js`)**

   - Komponen AddContact diinisialisasi dengan beberapa state:
     ```javascript
     const [form, setForm] = useState({ name: "", phone: "" }); // State untuk menyimpan data formulir
     const [error, setError] = useState(""); // State untuk menyimpan pesan error
     const [isSubmitting, setIsSubmitting] = useState(false); // State untuk menandai apakah formulir sedang disubmit
     ```
   - State yang digunakan:
     - `form`: Menyimpan data input nama dan nomor telepon
     - `error`: Menyimpan pesan error jika terjadi kesalahan
     - `isSubmitting`: Menandai status proses submit form

2. **Form Handling dan Validasi**

   - Fungsi `handleSubmit` menangani proses submit form:

     ```javascript
     // Fungsi untuk menangani submit formulir
     const handleSubmit = async (e) => {
       e.preventDefault(); // Mencegah perilaku default form submit
       setError(""); // Mengosongkan pesan error
       setIsSubmitting(true); // Menandai bahwa proses submit dimulai

       // 5.5 Validasi input
       if (!form.name.trim() || !form.phone.trim()) {
         setError("Name and phone number are required");
         setIsSubmitting(false); // Menandai bahwa proses submit berakhir
         return;
       }
       // ... proses submit ke API
     };
     ```

   - Validasi yang dilakukan:
     - Mencegah perilaku default form submit
     - Mengosongkan pesan error sebelumnya
     - Memeriksa apakah nama dan nomor telepon sudah diisi
     - Menampilkan pesan error jika ada field yang kosong
     - Fungsi ini digunakan untuk mencegah perilaku default dari event yang terjadi. Dalam konteks formulir, perilaku default adalah mengirimkan data formulir dan memuat ulang halaman. Dengan memanggil e.preventDefault(), kita menghentikan proses tersebut sehingga kita dapat menangani pengiriman data secara manual menggunakan JavaScript.

3. **Input Handling**

   - Fungsi `handleChange` menangani perubahan input:
     ```javascript
     // Fungsi untuk menangani perubahan input
     const handleChange = (e) => {
       const { name, value } = e.target;
       setForm((prev) => ({ ...prev, [name]: value })); // Memperbarui state form dengan nilai input terbaru
     };
     ```
   - Setiap perubahan pada input field akan:
     - Mengambil nama field dan nilai baru
     - Memperbarui state form dengan nilai terbaru
     - Menjaga nilai field lain tetap sama

4. **API Integration**

   - Proses submit form ke API:
     ```javascript
     try {
       // Mencoba menambahkan kontak baru
       await onAdd(form);
       navigate("/"); // Navigasi ke halaman utama jika berhasil
     } catch (error) {
       setError(error.message || "Error adding contact");
     } finally {
       setIsSubmitting(false); // Menandai bahwa proses submit berakhir
     }
     ```
   - Tahapan integrasi:
     - Mengirim data form ke API melalui fungsi `onAdd`
     - Navigasi ke halaman utama jika berhasil
     - Menampilkan pesan error jika gagal
     - Mengatur status submitting kembali ke false

5. **Navigation Handling**

   - Menggunakan React Router untuk navigasi:
     - Import `useNavigate` dari 'react-router-dom'
     - Navigasi ke halaman utama setelah submit berhasil
     - Navigasi kembali saat user membatalkan proses

6. **Error Handling**
   - Menampilkan pesan error jika:
     - Ada field yang kosong saat submit
     - Terjadi kesalahan saat mengirim data ke API
   - Error ditampilkan dalam UI untuk memberi feedback ke user

# 4. Proses Fitur Edit Contact dari mulai user mengklik button "Edit Contact" pada halaman utama

Proses fitur Edit Contact terdiri dari beberapa tahapan:

1. **Inisiasi Edit Mode (`frontend/src/components/ContactCard.js`)**

   - Setiap kontak memiliki state untuk mode edit:
     ```javascript
     const [isEditing, setIsEditing] = useState(false); // Menginisialisasi state untuk mode edit
     const [form, setForm] = useState({
       name: contact.name,
       phone: contact.phone,
     }); // Menyiapkan form data dengan nilai kontak saat ini
     ```
   - State yang digunakan:
     - `isEditing`: Menandai apakah kontak sedang dalam mode edit
     - `form`: Menyimpan data kontak yang sedang diedit

2. **Aktivasi Mode Edit**

   - Fungsi untuk mengaktifkan mode edit:
     ```javascript
     // Fungsi untuk mengaktifkan mode edit
     const handleEditClick = () => {
       setIsEditing(true); // Mengaktifkan mode edit
       setForm({
         name: contact.name,
         phone: contact.phone,
       }); // Menginisialisasi form dengan data kontak saat ini
     };
     ```
   - Proses yang terjadi:
     - Mengubah state `isEditing` menjadi true
     - Menginisialisasi form dengan data kontak saat ini

3. **Form Edit Handling**

   - Fungsi untuk menangani perubahan input:
     ```javascript
     const handleChange = (e) => {
       const { name, value } = e.target;
       setForm((prev) => ({
         ...prev,
         [name]: value,
       }));
     };
     ```
   - Validasi input:
     ```javascript
     // Fungsi untuk melakukan validasi form
     const validateForm = () => {
       if (!form.name.trim() || !form.phone.trim()) {
         setError("Nama dan nomor telepon harus diisi");
         return false;
       }
       return true;
     };
     ```

4. **Proses Penyimpanan**

   - Fungsi untuk menyimpan perubahan:

     ```javascript
     // Fungsi untuk menyimpan perubahan saat mengedit
     const handleSave = async () => {
       if (!validateForm()) return; // Validasi form

       try {
         await onEdit(contact.id, form); // Memanggil fungsi onEdit yang diterima dari props
         setIsEditing(false); // Menonaktifkan mode edit setelah berhasil menyimpan
         setError(""); // Membersihkan error
       } catch (error) {
         setError("Gagal menyimpan perubahan"); // Menampilkan error jika gagal
       }
     };
     ```

   - Tahapan penyimpanan:
     - Validasi form sebelum menyimpan
     - Mengirim data ke API melalui fungsi `onEdit`
     - Menonaktifkan mode edit jika berhasil
     - Menampilkan error jika gagal

5. **Pembatalan Edit**

   - Fungsi untuk membatalkan edit:
     ```javascript
     const handleCancel = () => {
       setIsEditing(false);
       setForm({
         name: contact.name,
         phone: contact.phone,
       });
       setError("");
     };
     ```
   - Proses pembatalan:
     - Menonaktifkan mode edit
     - Mengembalikan form ke data awal
     - Menghapus pesan error

6. **Integrasi dengan MainPage**
   - Fungsi update di MainPage:
     ```javascript
     const handleEdit = async (id, updatedContact) => {
       // Fungsi untuk navigasi ke halaman edit kontak
       try {
         await api.updateContact(id, updatedContact); // Memanggil API untuk memperbarui kontak
         const updatedContacts = contacts.map((contact) =>
           contact.id === id ? { ...contact, ...updatedContact } : contact
         ); // Memperbarui state contacts setelah edit berhasil
         setContacts(updatedContacts); // Memperbarui state kontak
       } catch (error) {
         console.error("Gagal mengupdate kontak:", error);
       }
     };
     ```
   - Proses update:
     - Mengirim data ke API
     - Memperbarui state kontak di frontend
     - Menangani error jika terjadi kesalahan

# 5. Proses Fitur Upload Avatar dari mulai user mengklik gambar avatar pada halaman utama

Proses fitur Upload Avatar terdiri dari beberapa tahapan detail berikut:

1. **Inisiasi Komponen dan State (`frontend/src/components/AvatarUpload.js`)**

   ```javascript
   const AvatarUpload = () => {
     const { id } = useParams(); // Mengambil parameter id dari URL
     const navigate = useNavigate(); // Hook untuk navigasi
     const [preview, setPreview] = useState(null); // State untuk menyimpan preview avatar
     const [currentAvatar, setCurrentAvatar] = useState(null); // State untuk menyimpan avatar saat ini
     const [uploading, setUploading] = useState(false); // State untuk menandai proses upload
     const [error, setError] = useState(""); // State untuk menyimpan pesan error
     const fileInputRef = useRef(null); // Referensi untuk input file
   };
   ```

   - Penjelasan Proses:
     - Mengambil ID kontak dari parameter URL
     - Inisialisasi state untuk preview dan avatar
     - Menyiapkan referensi untuk input file
   - Keterhubungan:
     - Menggunakan react-router-dom untuk navigasi dan params
     - Terhubung dengan API service untuk data kontak

2. **Pengambilan Data Avatar Saat Ini**

   ```javascript
   useEffect(() => {
     // Fungsi untuk mengambil data kontak berdasarkan ID
     const fetchContact = async () => {
       try {
         // Mengirim request ke API untuk mengambil data kontak
         const contact = await api.getContactById(id);
         if (contact) {
           // Menyimpan avatar saat ini ke state
           setCurrentAvatar(contact.photo);
         }
       } catch (err) {
         // Menangani error jika gagal mengambil data
         setError("Gagal mengambil informasi kontak");
       }
     };
     // Memanggil fungsi fetchContact saat komponen dimuat
     fetchContact();
   }, [id]);
   ```

   - Penjelasan Proses:
     - Mengambil data kontak saat komponen dimuat
     - Menyimpan avatar saat ini ke state
     - Menangani error jika gagal mengambil data

3. **Validasi dan Pemilihan File**

   ```javascript
   const handleFileSelect = useCallback((file) => {
     // Daftar tipe file gambar yang diperbolehkan
     const validTypes = ["image/jpeg", "image/png", "image/jpg"];
     if (!validTypes.includes(file.type)) {
       // Menampilkan error jika tipe file tidak valid
       setError("Pilih file gambar yang valid (JPG, PNG)");
       return;
     }
     // Membatasi ukuran file 5MB
     if (file.size > 5 * 1024 * 1024) {
       // Menampilkan error jika ukuran file terlalu besar
       setError("Ukuran file harus kurang dari 5MB");
       return;
     }
     // Proses file valid
     setError("");
     const reader = new FileReader();
     // Membuat preview gambar dengan FileReader
     reader.onloadend = () => setPreview(reader.result); // Menyimpan preview ke state saat file valid
     reader.readAsDataURL(file); // Membaca file sebagai data URL
   }, []);
   ```

   - Proses Validasi:
     - Memeriksa tipe file (JPG/PNG)
     - Memeriksa ukuran maksimal (5MB)
     - Membuat preview menggunakan FileReader
   - Penanganan Error:
     - Menampilkan pesan error spesifik
     - Membersihkan error saat file valid

4. **Proses Upload ke Server**

   ```javascript
   /**
    * Fungsi untuk mengupload avatar ke server
    * @param {File} file File gambar yang akan diupload
    */
   const handleUpload = async (file) => {
     // Menandai bahwa proses upload sedang berlangsung
     setUploading(true);
     // Membuat FormData dengan file yang akan diupload
     const formData = new FormData();
     formData.append("avatar", file);

     try {
       // Mengirim request ke API untuk mengupload avatar
       await api.updateAvatar(id, formData);
       // Navigasi ke halaman utama setelah upload berhasil
       navigate("/");
     } catch (error) {
       // Menampilkan pesan error jika gagal mengupload
       setError("Gagal mengupload avatar");
     } finally {
       // Menandai bahwa proses upload sudah selesai
       setUploading(false);
     }
   };
   ```

   - Tahapan Upload:
     - Membuat FormData dengan file
     - Mengirim ke API endpoint
     - Menangani response dan error
     - Navigasi setelah sukses

**Alur Proses Teknis Lengkap:**

1. User mengklik avatar di halaman utama
2. Sistem:
   - Mengarahkan ke halaman upload
   - Mengambil data kontak dan avatar saat ini
3. User memilih file:
   - Melalui dialog file atau drag & drop
   - Sistem memvalidasi file
   - Menampilkan preview jika valid
4. User mengkonfirmasi upload:
   - Sistem mengirim file ke server
   - Menampilkan status progress
   - Menangani sukses/gagal upload
5. Setelah upload selesai:
   - Sukses: Kembali ke halaman utama
   - Gagal: Tampilkan pesan error

# 6. Proses Fitur Delete Contact dari mulai user mengklik button "Delete Contact" pada halaman utama

Proses fitur Delete Contact terdiri dari beberapa tahapan detail berikut:

1. **Inisiasi Delete Process (`frontend/src/components/ContactCard.js`)**

   ```javascript
   const ContactCard = ({ contact, onDelete }) => {
     const [showConfirm, setShowConfirm] = useState(false);

     const handleDelete = () => {
       setShowConfirm(true);
     };
   ```

   - Penjelasan Proses:
     - Komponen menerima props `contact` dan fungsi `onDelete`
     - Mengelola state untuk konfirmasi dan proses delete
     - Menampilkan dialog konfirmasi saat tombol delete diklik
   - Keterhubungan:
     - Menerima props dari `ContactList.js`
     - Menggunakan fungsi delete dari `MainPage.js`

2. **Dialog Konfirmasi Delete**

   ```javascript
   {
     /* Dialog konfirmasi hapus */
   }
   {
     showConfirm && (
       <div className="modal-overlay">
         <div className="confirm-dialog">
           <p>Are you sure you want to delete this contact?</p>
           <div className="confirm-buttons">
             <button onClick={confirmDelete}>Yes</button>
             <button onClick={() => setShowConfirm(false)}>No</button>
           </div>
         </div>
       </div>
     );
   }
   ```

   - Penjelasan Proses:

     - Menampilkan dialog konfirmasi saat `showConfirm` true
     - Memanggil fungsi confirmDelete
     - Menutup dialog saat tombol No diklik

   - Keterhubungan:
     - Menggunakan state `showConfirm`

3. **Proses Delete ke Server**

   ```javascript
   // Fungsi untuk mengkonfirmasi dan melakukan penghapusan
   const confirmDelete = async () => {
     try {
       // Memanggil fungsi onDelete yang diterima dari props
       await onDelete(contact.id);
     } catch (error) {
       console.log("Error deleting contact:", error);
     } finally {
       // Menutup dialog konfirmasi setelah selesai
       setShowConfirm(false);
     }
   };
   ```

   - Tahapan Delete:

     - Memanggil fungsi onDelete
     - Menangani error jika ada
     - Menutup dialog konfirmasi

   - Keterhubungan:
     - Menggunakan fungsi delete dari `MainPage.js`

4. **Integrasi dengan MainPage (`frontend/src/components/MainPage.js`)**

   ```javascript
   const MainPage = () => {
     const handleDelete = async (id) => {
       try {
         await api.deleteContact(id);
         const updatedContacts = contacts.filter(
           (contact) => contact.id !== id
         );
         setContacts(updatedContacts);
       } catch (error) {
         console.error("Gagal menghapus kontak:", error);
       }
     };
   };
   ```

   - Proses di MainPage:

     - Memanggil API delete
     - Memperbarui state contacts
     - Menangani error jika gagal

   - Keterhubungan:
     - Menggunakan fungsi delete dari `ContactCard.js`

5. **Integrasi dengan API Service (`frontend/src/services/api.js`)**
   ```javascript
   const api = {
     deleteContact: async (id) => {
       try {
         await axios.delete(`${API_URL}/contacts/${id}`);
       } catch (error) {
         throw new Error("Gagal menghapus kontak");
       }
     },
   };
   ```
   - Implementasi API:
     - Menggunakan axios untuk HTTP request
     - Endpoint DELETE ke server
     - Penanganan error

**Alur Proses Teknis Lengkap:**

1. Inisiasi Delete:

   - User mengklik tombol Delete di ContactCard
   - Sistem menampilkan dialog konfirmasi
   - State `showConfirm` diubah menjadi true

2. Konfirmasi Delete:

   - User memilih Ya/Tidak di dialog
   - Jika Tidak: Dialog ditutup
   - Jika Ya: Proses delete dimulai

3. Proses Delete:

   - State `deleting` diset true
   - Fungsi `handleDelete` di MainPage dipanggil
   - Request DELETE dikirim ke server
   - State contacts diupdate jika berhasil

4. Penanganan Response:

   - Sukses:
     - Dialog konfirmasi ditutup
     - List kontak diperbarui
     - Feedback sukses ditampilkan
   - Gagal:
     - Pesan error ditampilkan
     - State deleting diset false
     - User dapat mencoba lagi

5. Update UI:
   - Kontak dihapus dari daftar
   - Animasi transisi (jika ada)
   - Reset state komponen

# 7. Proses Fitur Search Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama

Proses fitur Search Contact terdiri dari beberapa tahapan detail berikut:

1. **Inisiasi Komponen SearchBar (`frontend/src/components/SearchBar.js`)**

   ```javascript
   const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
     const handleSearchChange = (e) => {
       const newValue = e.target.value;
       onChange(newValue);
     };
   ```

   - Penjelasan Proses:
     - Komponen menerima props `value` dan `onChange` untuk pencarian
     - `handleSearchChange` menangkap input user dan meneruskannya ke parent
   - Keterhubungan:
     - Terhubung dengan MainPage yang mengelola state pencarian
     - Menggunakan custom hook useContacts untuk logika pencarian

2. **State Management di useContacts (`frontend/src/hooks/useContacts.js`)**

   ```javascript
   const [search, setSearch] = useState(() => {
     const savedSearch = sessionStorage.getItem("contactSearch");
     const isActive = sessionStorage.getItem("searchActive");
     return isActive === "true" ? savedSearch : "";
   });

   const handleSearch = useCallback((value) => {
     setSearch(value);
     sessionStorage.setItem("contactSearch", value || "");
     if (value) {
       sessionStorage.setItem("searchActive", "true");
     } else {
       sessionStorage.removeItem("searchActive");
     }
   }, []);
   ```

   - Penjelasan Proses:
     - Inisialisasi state pencarian dari sessionStorage
     - Menyimpan status pencarian aktif
     - Memperbarui sessionStorage saat pencarian berubah

3. **Implementasi Pencarian di MainPage (`frontend/src/components/MainPage.js`)**

   ```javascript
   const handleSearch = (value) => {
     setSearch(value);
     if (!value) {
       sessionStorage.removeItem("contactSearch");
     } else {
       sessionStorage.setItem("contactSearch", value);
       sessionStorage.setItem("searchActive", "true");
     }
   };
   ```

   - Proses di MainPage:
     - Menerima input pencarian dari SearchBar
     - Memperbarui state pencarian
     - Mengelola sessionStorage

4. **Proses Fetch Data dengan Filter**

   ```javascript
   const loadContacts = useCallback(
     async (loadMore = false) => {
       try {
         // Mengambil data kontak dari API
         const { phonebooks, ...pagination } = await api.getContacts(
           currentPage,
           10,
           sortBy,
           sortOrder,
           search
         );

         if (Array.isArray(phonebooks)) {
           // Jika loadMore true, tambahkan kontak baru ke daftar yang ada
           if (loadMore) {
             setContacts((prev) => [...prev, ...phonebooks]);
           } else {
             // Untuk load awal atau perubahan sort/search, ganti seluruh daftar kontak
             setContacts(phonebooks);
           }

           // Perbarui state pagination
           setHasMore(phonebooks.length > 0 && currentPage < pagination.pages);
           setPage(currentPage);
           console.log("Respon API UseContacts:", { phonebooks, pagination });
         }
       } catch (err) {
         // Tangani error jika terjadi kesalahan saat mengambil data
         setError(err.message || "Error saat mengambil kontak");
       }
     },
     [loading, page, sortBy, sortOrder, search] // Dependencies untuk useCallback
   );
   ```

   - Tahapan Fetch:

     - Mengambil data kontak dari API
     - Memfilter kontak berdasarkan pencarian
     - Memperbarui state kontak
     - Memperbarui state pagination

   - Keterhubungan:
     - Menggunakan custom hook useContacts untuk logika pencarian

**Alur Proses Teknis Lengkap:**

1. Input Pencarian:

   - User mengetik di field pencarian
   - SearchBar menangkap perubahan input
   - Nilai input diteruskan ke MainPage

2. Pemrosesan Pencarian:

   - MainPage menerima nilai pencarian
   - State pencarian diperbarui di useContacts
   - SessionStorage diperbarui untuk persistensi

3. Fetch Data:

   - Request API dipanggil dengan parameter pencarian
   - Data difilter di server berdasarkan keyword
   - Hasil pencarian dikembalikan dengan pagination

4. Update UI:

   - Daftar kontak diperbarui dengan hasil pencarian
   - Loading state ditampilkan selama proses
   - Error ditampilkan jika terjadi masalah

5. Persistensi State:
   - Status pencarian disimpan di sessionStorage
   - State dipulihkan saat halaman dimuat ulang
   - Pencarian dibersihkan saat browser ditutup

# 8. Proses Fitur Search, Sorting, dan Edit Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama dan mengklik sort button dan juga mengklik tombol edit pada halaman utama

## A. Fitur Pencarian (Search)

1. **Inisialisasi Komponen dan State**

   - Komponen `SearchBar` menerima props untuk nilai pencarian dan fungsi handler
   - State pencarian diinisialisasi di `useContacts` hook dengan nilai dari sessionStorage

   ```javascript
   // Inisialisasi state pencarian
   const [search, setSearch] = useState(() => {
     // Mengambil nilai pencarian yang tersimpan dari sessionStorage
     const savedSearch = sessionStorage.getItem("contactSearch");
     // Mengambil status aktif pencarian dari sessionStorage
     const isActive = sessionStorage.getItem("searchActive");
     // Mengembalikan nilai savedSearch jika pencarian aktif, jika tidak, mengembalikan string kosong
     return isActive === "true" ? savedSearch : "";
   });
   ```

   - Penjelasan Proses:

     - Inisialisasi state pencarian
     - Mengambil nilai pencarian yang tersimpan dari sessionStorage
     - Mengambil status aktif pencarian dari sessionStorage
     - Mengembalikan nilai pencarian jika pencarian aktif, jika tidak, mengembalikan string kosong

   - Keterhubungan:
     - Menggunakan custom hook useContacts untuk logika pencarian

2. **Proses Pencarian**

   - User mengetik di field pencarian
   - `handleSearchChange` di SearchBar menangkap input

   ```javascript
   // Komponen SearchBar menerima props value, onChange, onSort, dan onAdd
   const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
   // Fungsi untuk menangani perubahan input pencarian
   const handleSearchChange = (e) => {
    const newValue = e.target.value;
    // Meneruskan nilai ke komponen induk (MainPage)
    onChange(newValue);
   };

   ```

// Render komponen pencarian
return (

<div className="search-input-container">
<BsSearch className="search-icon" />
<input
        type="text"
        placeholder="Search contacts..."
        value={value}
        onChange={handleSearchChange}
        aria-label="Search contacts"
      />
</div>
);
```

- Nilai diteruskan ke MainPage melalui props

  ```javascript
  const MainPage = () => {
    // Menggunakan custom hook useContacts untuk state dan fungsi pencarian
    const { contacts, search, setSearch } = useContacts();

    return (
      <div className="app">
        {/* Meneruskan props ke SearchBar */}
        <SearchBar
          value={search}
          onChange={handleSearch}
          onSort={handleSort}
          onAdd={handleAdd}
        />
        {/* Komponen lainnya */}
      </div>
    );
  };
  ```

- State pencarian diperbarui dan disimpan di sessionStorage

  ```javascript
  // Fungsi untuk menangani pencarian
  const handleSearch = (value) => {
    setSearch(value);
    // Mengelola penyimpanan pencarian di sessionStorage
    if (!value) {
      // Hapus data pencarian jika input kosong
      sessionStorage.removeItem("contactSearch");
    } else {
      // Simpan pencarian dan status aktif
      sessionStorage.setItem("contactSearch", value);
      sessionStorage.setItem("searchActive", "true");
    }
  };
  ```

- API dipanggil dengan parameter pencarian untuk memfilter kontak

  ```javascript
  // Fungsi untuk memuat kontak
  const loadContacts = useCallback(
    async (loadMore = false) => {
      try {
        // Mengambil data kontak dari API
        const { phonebooks, ...pagination } = await api.getContacts(
          currentPage,
          10,
          sortBy,
          sortOrder,
          search
        );
        // Perbarui state kontak
        setContacts(phonebooks);
        // Perbarui state pagination
        setHasMore(phonebooks.length > 0 && currentPage < pagination.pages);
        setPage(currentPage);
      } catch (err) {
        // Tangani error jika terjadi kesalahan saat mengambil data
        setError(err.message || "Error saat mengambil kontak");
      }
    },
    [loading, page, sortBy, sortOrder, search] // Dependencies untuk useCallback
  );
  ```

## B. Fitur Pengurutan (Sorting)

1. **Inisialisasi State Pengurutan**

   ```javascript
   const [sortOrder, setSortOrder] = useState(() => {
     return sessionStorage.getItem("contactSortOrder") || "asc";
   });
   ```

2. **Proses Pengurutan**
   - User mengklik tombol sort di SearchBar
   ```javascript
     const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
   // State untuk menyimpan urutan pengurutan (asc/desc)
   const [sortOrder, setSortOrder] = useState(() => {
    return sessionStorage.getItem('contactSortOrder') || 'asc';
   });
   ```

// Fungsi untuk menangani pengurutan
const handleSort = () => {
// Mengubah urutan pengurutan (asc ke desc atau sebaliknya)
const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
// Memperbarui state lokal
setSortOrder(newSortOrder);
// Menyimpan preferensi ke sessionStorage
sessionStorage.setItem('contactSortOrder', newSortOrder);
// Memanggil fungsi onSort dari parent dengan parameter nama dan urutan baru
onSort('name', newSortOrder);
};

return (

<div className="search-bar">
{/_ Tombol pengurutan dengan ikon yang berubah sesuai urutan _/}
<button onClick={handleSort} className="sort-button" aria-label="Sort contacts">
{sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
</button>
{/_ Komponen lainnya _/}
</div>
);
};
``

- Handler `handleSort` mengubah urutan (asc/desc)

```javascript
const MainPage = () => {
  const { contacts, setSortBy, setSortOrder } = useContacts();

  // Fungsi untuk menangani pengurutan
  const handleSort = (field, order) => {
    setSortBy(field); // Mengatur field pengurutan
    setSortOrder(order); // Mengatur urutan pengurutan
  };

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={handleSearch}
        onSort={handleSort} // Meneruskan fungsi sort ke SearchBar
        onAdd={handleAdd}
      />
      {/* Komponen lainnya */}
    </div>
  );
};
```

- State pengurutan diperbarui di useContacts

```javascript
const useContacts = () => {
  // State untuk field pengurutan (defaultnya 'name')
  const [sortBy, setSortBy] = useState(() => {
    return sessionStorage.getItem("contactSortBy") || "name";
  });

  // State untuk urutan pengurutan (asc/desc)
  const [sortOrder, setSortOrder] = useState(() => {
    return sessionStorage.getItem("contactSortOrder") || "asc";
  });

  // Fungsi untuk menangani perubahan pengurutan
  const handleSort = useCallback((field, order) => {
    // Menyimpan preferensi pengurutan ke sessionStorage
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    setPage(1);         // Reset halaman ke 1
    setContacts([]);    // Kosongkan daftar kontak
    setSortBy(field);   // Update state sortBy
    setSortOrder(order);// Update state sortOrder
  }, []);

- Kontak diurutkan ulang sesuai kriteria baru

  // Effect untuk memuat ulang kontak saat pengurutan berubah
  useEffect(() => {
    const fetchData = async () => {
      setContacts([]);
      setPage(1);
      setHasMore(true);
      await loadContacts(false);
    };
    fetchData();
  }, [sortBy, sortOrder, search]);

- Hasil pengurutan disimpan di sessionStorage

  return {
    sortBy,
    sortOrder,
    setSortBy: handleSort,
    setSortOrder,
    // state lainnya
  };
};
```

## C. Fitur Edit Contact

1. **Proses Edit**

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
         contact.id === id ? { ...contact, ...updatedContact } : contact
       );
       refreshContacts(updatedContacts);
       setContacts(updatedContacts);
     } catch (error) {
       console.log("Error updating contact:", error);
     }
   };
   ```

2. **Fitur Khusus Edit dalam Mode Pencarian**

````javascript
const handleEdit = async (id, updatedContact) => {
try {
  // Mengirim permintaan update ke API
  await api.updateContact(id, updatedContact);

  // Update kontak secara lokal terlebih dahulu
  const updatedContacts = contacts.map(
    contact => contact.id === id ? { ...contact, ...updatedContact } : contact
  );

  // Memeriksa jika sedang dalam mode pencarian
  if (search) {
    const searchLower = search.toLowerCase();
    // Memeriksa apakah kontak yang diupdate masih sesuai dengan kriteria pencarian
    const isStillMatching =
      updatedContact.name.toLowerCase().includes(searchLower) ||
      updatedContact.phone.toLowerCase().includes(searchLower);

    if (!isStillMatching) {
      // Jika tidak sesuai kriteria, hapus dari daftar yang ditampilkan
      setContacts(contacts.filter(contact => contact.id !== id));
      return;
    }
  }

  // Jika masih sesuai kriteria atau tidak dalam mode pencarian,
  // update daftar kontak dengan data terbaru
  setContacts(updatedContacts);
} catch (error) {
  console.error("Error updating contact:", error);
}
};
````
 - Sistem memeriksa apakah kontak yang diedit masih sesuai kriteria pencarian
 - Jika tidak sesuai, kontak dihapus dari tampilan
 - Jika sesuai, kontak diperbarui dalam daftar

## D. Integrasi Ketiga Fitur

1. **State Management**

 - Semua state dikelola di useContacts hook
 - Perubahan state memicu pembaruan tampilan
 - Data persisten disimpan di sessionStorage

2. **Optimasi Performa**

 - Penggunaan useCallback untuk fungsi-fungsi penting
 - Implementasi lazy loading untuk daftar kontak
 - Penanganan error yang komprehensif

3. **User Experience**
 - Feedback langsung untuk setiap aksi user
 - Transisi halus antar state
 - Persistensi preferensi pengguna

# 9. Proses Fitur Edit Contact dapat dilakukan perubahaan secara bersamaan di halaman utama

Fitur edit contact memungkinkan pengguna untuk mengubah informasi kontak secara langsung di halaman utama. Perubahan ini dapat dilakukan secara bersamaan, sehingga pengguna dapat melihat hasil perubahan secara real-time.

## A. Implementasi Komponen EditContact

1. **Inisialisasi State dan Props**

 ```javascript
 const EditContact = ({ contact, onSave, onCancel }) => {
   const [form, setForm] = useState({
     name: contact.name,
     phone: contact.phone
   });
   const [error, setError] = useState('');
````

- Komponen menerima data kontak yang akan diedit
- State form menyimpan nilai input yang diubah
- State error untuk menangani validasi

2. **Validasi dan Submit Form**
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     if (!form.name.trim() || !form.phone.trim()) {
       setError("Nama dan nomor telepon harus diisi");
       return;
     }
     // Proses update...
   };
   ```
   - Mencegah reload halaman saat submit
   - Validasi field yang wajib diisi
   - Menampilkan pesan error jika validasi gagal

## B. Integrasi dengan MainPage

1. **Handler Edit di MainPage**

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
         contact.id === id ? { ...contact, ...updatedContact } : contact
       );
       refreshContacts(updatedContacts);
       setContacts(updatedContacts);
     } catch (error) {
       console.log("Error updating contact:", error);
     }
   };
   ```

2. **Fitur Khusus Saat Edit**
   - Pengecekan status pencarian aktif
   - Validasi kontak yang diedit masih sesuai kriteria pencarian
   - Update UI secara real-time

## C. State Management dengan useContacts

1. **Pengelolaan State Global**

   ```javascript
   const useContacts = () => {
     const [contacts, setContacts] = useState([]);
     // State lainnya...

     const refreshContacts = useCallback(() => {
       setContacts([]);
       setPage(1);
       setHasMore(true);
       loadContacts(false);
     }, [loadContacts]);

     return {
       contacts,
       setContacts,
       refreshContacts,
       // State dan fungsi lainnya...
     };
   };
   ```

   - Manajemen state kontak terpusat
   - Fungsi refresh untuk memperbarui data
   - Integrasi dengan fitur pencarian dan pengurutan

## D. Optimasi Performa

1. **Penggunaan useCallback**

   - Mencegah re-render yang tidak perlu
   - Meningkatkan efisiensi memori

2. **Real-time Update**

   - Update UI langsung setelah edit
   - Mempertahankan state pencarian dan pengurutan
   - Penanganan error yang baik

3. **Validasi Data**
   - Validasi input sebelum update
   - Pengecekan format data
   - Feedback langsung ke pengguna

## E. Integrasi dengan Fitur Lain

1. **Sinkronisasi dengan Pencarian**

   - Mempertahankan hasil pencarian
   - Update tampilan sesuai kriteria pencarian

2. **Kompatibilitas dengan Pengurutan**

   - Mempertahankan urutan setelah edit
   - Update posisi kontak sesuai kriteria sort

3. **User Experience**
   - Feedback visual saat proses edit
   - Pesan error yang informatif
   - Transisi halus antar state

# 10. Proses Fitur Searching dan Sorting di Halaman Utama

## A. Implementasi Fitur Pencarian (Searching)

1. **Inisialisasi State Pencarian di useContacts**

   ```javascript
   const [search, setSearch] = useState(() => {
     const savedSearch = sessionStorage.getItem("contactSearch");
     const isActive = sessionStorage.getItem("searchActive");
     return isActive === "true" ? savedSearch : "";
   });
   ```

   - Menggunakan sessionStorage untuk menyimpan state pencarian
   - Mempertahankan pencarian saat halaman di-refresh
   - Mengembalikan string kosong jika tidak ada pencarian aktif

2. **Handler Pencarian**
   ```javascript
   const handleSearch = useCallback((value) => {
     setSearch(value);
     sessionStorage.setItem("contactSearch", value || "");
     if (value) {
       sessionStorage.setItem("searchActive", "true");
     } else {
       sessionStorage.removeItem("searchActive");
     }
   }, []);
   ```
   - Memperbarui state pencarian
   - Menyimpan pencarian di sessionStorage
   - Mengelola status pencarian aktif

## B. Implementasi Fitur Pengurutan (Sorting)

1. **Inisialisasi State Pengurutan**

   ```javascript
   const [sortBy, setSortBy] = useState(() => {
     return sessionStorage.getItem("contactSortBy") || "name";
   });

   const [sortOrder, setSortOrder] = useState(() => {
     return sessionStorage.getItem("contactSortOrder") || "asc";
   });
   ```

   - Menyimpan field pengurutan (sortBy)
   - Menyimpan arah pengurutan (sortOrder)
   - Nilai default: name dan ascending

2. **Handler Pengurutan**
   ```javascript
   const handleSort = useCallback((field, order) => {
     sessionStorage.setItem("contactSortBy", field);
     sessionStorage.setItem("contactSortOrder", order);
     setPage(1);
     setContacts([]);
     setSortBy(field);
     setSortOrder(order);
   }, []);
   ```
   - Memperbarui preferensi pengurutan
   - Mereset halaman dan daftar kontak
   - Memicu pemuatan data baru

## C. Integrasi dengan API

1. **Pemanggilan API dengan Parameter**

   ```javascript
   const { phonebooks, ...pagination } = await api.getContacts(
     currentPage,
     10,
     sortBy,
     sortOrder,
     search
   );
   ```

   - Mengirim parameter pencarian dan pengurutan
   - Menerima data terfilter dan terurut
   - Menangani pagination

2. **Pembaruan Data**
   ```javascript
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
   }
   ```
   - Memperbarui daftar kontak
   - Menangani load more
   - Menghindari duplikasi data

## D. Optimasi dan User Experience

1. **Persistensi Data**

   - Menyimpan preferensi di sessionStorage
   - Memulihkan state saat refresh
   - Membersihkan state saat browser ditutup

2. **Performa**

   - Menggunakan useCallback untuk fungsi-fungsi penting
   - Menghindari render yang tidak perlu
   - Implementasi lazy loading

3. **Feedback Pengguna**
   - Indikator loading saat memuat data
   - Pesan error jika terjadi masalah
   - UI yang responsif

## E. Fitur Tambahan

1. **Infinite Scrolling**

   - Memuat data secara bertahap
   - Menggunakan Intersection Observer
   - Mengoptimalkan performa

2. **Integrasi dengan Fitur Lain**
   - Sinkronisasi dengan edit kontak
   - Kompatibilitas dengan hapus kontak
   - Pembaruan avatar

# 11. Proses Fitur Searching Contact dan Navigasi

## A. Alur Pencarian Kontak

1. **Inisialisasi State dan Handler Pencarian**

   ```javascript
   // Di dalam useContacts.js
   const [search, setSearch] = useState(() => {
     const savedSearch = sessionStorage.getItem("contactSearch");
     const isActive = sessionStorage.getItem("searchActive");
     return isActive === "true" ? savedSearch : "";
   });
   ```

   - State `search` diinisialisasi dengan nilai dari sessionStorage
   - Jika ada pencarian aktif sebelumnya, nilai tersebut akan digunakan
   - Jika tidak ada, state diinisialisasi dengan string kosong

2. **Implementasi Handler Pencarian**

   ```javascript
   const handleSearch = useCallback((value) => {
     setSearch(value);
     sessionStorage.setItem("contactSearch", value || "");
     if (value) {
       sessionStorage.setItem("searchActive", "true");
     } else {
       sessionStorage.removeItem("searchActive");
     }
   }, []);
   ```

   - Memperbarui state pencarian dengan nilai input
   - Menyimpan pencarian ke sessionStorage
   - Mengelola status pencarian aktif

3. **Integrasi dengan API**
   ```javascript
   const { phonebooks, ...pagination } = await api.getContacts(
     currentPage,
     10,
     sortBy,
     sortOrder,
     search
   );
   ```
   - Mengirim parameter pencarian ke API
   - Menerima data yang sudah difilter sesuai pencarian
   - Menangani pagination untuk hasil pencarian

## B. Navigasi ke Add Contact dan Kembali

1. **Implementasi Tombol Add Contact**

   ```javascript
   // Di dalam MainPage.js
   const handleAdd = () => {
     navigate("/add");
   };
   ```

   - Menggunakan React Router untuk navigasi
   - Menyimpan state pencarian sebelum navigasi

2. **Mempertahankan State Pencarian**

   ```javascript
   useEffect(() => {
     const params = new URLSearchParams(location.search);
     const searchQuery = params.get("search");
     if (searchQuery) {
       sessionStorage.setItem("contactSearch", searchQuery);
       sessionStorage.setItem("searchActive", "true");
     }
   }, [location.search]);
   ```

   - Menyimpan query pencarian di sessionStorage
   - Memulihkan state pencarian saat kembali

3. **Penanganan Cancel dan Kembali**

   ```javascript
   // Di dalam AddContact.js
   const handleCancel = () => {
     // Kembali ke halaman sebelumnya
     navigate(-1);
   };

   // Di dalam MainPage.js
   useEffect(() => {
     // Memulihkan state pencarian saat kembali
     const savedSearch = sessionStorage.getItem("contactSearch");
     const isActive = sessionStorage.getItem("searchActive");

     if (isActive === "true" && savedSearch) {
       setSearch(savedSearch);
       // Memuat ulang hasil pencarian
       refreshContacts();
     }
   }, []);
   ```

   - Menggunakan React Router `navigate(-1)` untuk kembali ke halaman sebelumnya
   - Memulihkan state pencarian dari sessionStorage saat kembali
   - Menampilkan hasil pencarian sebelumnya dengan `refreshContacts()`

## C. Optimasi dan User Experience

1. **Persistensi Data**

   - State pencarian disimpan di sessionStorage
   - Data bertahan selama sesi browser
   - Dibersihkan saat browser ditutup

2. **Performa**

   - Menggunakan debouncing untuk pencarian
   - Lazy loading untuk hasil pencarian
   - Optimasi render dengan useCallback

3. **Feedback Pengguna**
   - Loading indicator saat mencari
   - Pesan "No Results" jika tidak ada hasil
   - Transisi halus antar state

## D. Integrasi dengan Fitur Lain

1. **Sorting**

   - Hasil pencarian dapat diurutkan
   - Mempertahankan urutan saat navigasi

2. **Infinite Scrolling**

   - Memuat lebih banyak hasil pencarian
   - Mempertahankan posisi scroll

3. **Edit dan Delete**
   - Update hasil pencarian setelah edit
   - Refresh daftar setelah delete
