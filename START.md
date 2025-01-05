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

Berikut adalah penjelasan detail tentang proses yang terjadi saat menampilkan halaman Main Page setelah menjalankan perintah `npm start`:

## 2.1. Inisialisasi Aplikasi React (index.js)

1. **Entry Point Initialization**
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   ```
   - React dan ReactDOM diimpor sebagai dependencies utama
   - Komponen App diimpor sebagai root component

2. **Root Rendering**
   ```javascript
   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```
   - ReactDOM mencari elemen dengan id 'root' di index.html
   - Membuat root instance untuk React 18 dengan createRoot
   - Merender App component dalam StrictMode untuk development yang lebih aman

## 2.2. Routing dan Context Setup (App.js)

1. **Router dan Provider Setup**
   ```javascript
   import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
   import { ContactProvider } from "./hooks/useContacts";
   ```
   - Router diimpor untuk handling navigasi
   - ContactProvider diimpor untuk state management

2. **Route Configuration**
   ```javascript
   <Router>
     <ContactProvider>
       <Routes>
         <Route path="/" element={<MainPage />} />
       </Routes>
     </ContactProvider>
   </Router>
   ```
   - Router mengatur navigasi aplikasi
   - ContactProvider menyediakan context untuk manajemen state kontak
   - Route "/" dikonfigurasi untuk menampilkan MainPage

## 2.3. Main Page Component Initialization (MainPage.js)

1. **Component Setup dan Hooks**
   ```javascript
   const MainPage = () => {
     const navigate = useNavigate();
     const location = useLocation();
     const {
       state: { contacts, loading, error },
       handleSearch,
       loadContacts,
     } = useContacts();
   ```
   - useNavigate untuk navigasi programmatik
   - useLocation untuk akses URL parameters
   - useContacts untuk akses state dan methods terkait kontak

2. **Initial Data Loading**
   ```javascript
   useEffect(() => {
     loadContacts();
   }, []);
   ```
   - useEffect dijalankan saat komponen mount
   - loadContacts dipanggil untuk mengambil data kontak dari API

## 2.4. Sequence Flow

1. User menjalankan `npm start`
2. Development server dimulai (default: localhost:3000)
3. index.js dieksekusi, merender App component
4. App.js menginisialisasi router dan context providers
5. Router mendeteksi URL "/" dan merender MainPage
6. MainPage component diinisialisasi:
   - Hooks disetup (navigate, location, contacts)
   - Initial data loading dijalankan
   - UI dirender berdasarkan state yang ada

Proses ini terjadi secara cepat dan teroptimasi berkat Virtual DOM React yang hanya merender ulang komponen yang berubah.

# 3. Proses Menampilkan Halaman Add Contact dari mulai user mengklik button "Add Contact" pada halaman utama dan kemudian mengklik tombol "Save" pada halaman Add Contact
Berikut adalah penjelasan detail proses penambahan kontak baru dari awal hingga akhir:

## 3.1. Proses di Halaman Utama (`frontend/src/components/MainPage.js`)

1. **Persiapan Navigasi**
   ```javascript
   import { useNavigate } from "react-router-dom";
   
   const MainPage = () => {
     const navigate = useNavigate();
     // ...
   }
   ```
   - Mengimpor hook `useNavigate` dari react-router-dom untuk keperluan navigasi
   - Hook ini berfungsi untuk berpindah antar halaman dalam aplikasi

2. **Penanganan Tombol Add Contact**
   ```javascript
   const handleAddClick = () => {
     navigate('/add');
   };
   ```
   - Ketika tombol "Add Contact" diklik, fungsi `navigate` akan dipanggil
   - Fungsi ini akan mengarahkan pengguna ke halaman dengan rute '/add'

## 3.2. Proses di Komponen AddContact (`frontend/src/components/AddContact.js`)

1. **Inisialisasi State**
   ```javascript
   const AddContact = ({ onAdd }) => {
     // State untuk data formulir
     const [form, setForm] = useState({ name: '', phone: '' });
     // State untuk pesan kesalahan
     const [error, setError] = useState('');
     // State untuk status pengiriman
     const [isSubmitting, setIsSubmitting] = useState(false);
     const navigate = useNavigate();
   }
   ```
   - Membuat state `form` untuk menyimpan data nama dan nomor telepon
   - Membuat state `error` untuk menampung pesan kesalahan
   - Membuat state `isSubmitting` untuk menandai proses penyimpanan
   - Menyiapkan fungsi navigasi untuk kembali ke halaman utama

2. **Penanganan Input Formulir**
   ```javascript
   const handleChange = (e) => {
     const { name, value } = e.target;
     setForm(prev => ({
       ...prev,
       [name]: value
     }));
     setError('');
   };
   ```
   - Fungsi ini dipanggil setiap kali pengguna mengetik di form
   - Mengupdate state form sesuai dengan input pengguna
   - Menghapus pesan error saat pengguna mulai mengetik
   - `e.target` adalah element HTML yang sedang di-interaksi, seperti input field nama atau nomor telepon.

3. **Proses Penyimpanan**
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);
     
     try {
       // Validasi input
       if (!form.name || !form.phone) {
         setError('Nama dan nomor telepon harus diisi');
         return;
       }
       
       // Proses penyimpanan data
       await onAdd(form);
       
       // Kembali ke halaman utama
       handleCancel();
     } catch (error) {
       setError(error.message);
     } finally {
       setIsSubmitting(false);
     }
   };
   ```
   - Mencegah perilaku default form HTML
   - Menandai proses penyimpanan sedang berlangsung dengan `setIsSubmitting` menjadi `true`
   - Melakukan validasi input (nama dan nomor telepon wajib diisi)
   - Memanggil fungsi `onAdd` untuk menyimpan data ke server
   - Menangani error jika terjadi kesalahan
   - Menandai proses penyimpanan selesai dengan `setIsSubmitting` kembali ke `false`
   - Mengatur status loading saat proses berlangsung
   - Mencegah perilaku default form HTML, seperti refresh halaman, dengan cara memanggil `e.preventDefault()`.

4. **Integrasi dengan API**
   ```javascript
   // Di services/api.js
   const addContact = async (contact) => {
     try {
       const response = await axios.post(`${API_URL}/phonebooks`, contact);
       return response.data;
     } catch (error) {
       throw new Error('Gagal menambahkan kontak');
     }
   };
   ```
   - Mengirim permintaan POST ke endpoint API
   - Menyertakan data kontak dalam body request
   - Mengembalikan response dari server atau error jika gagal

## 3.3. Alur Proses Lengkap

1. **Tahap Awal**
   - Pengguna mengklik tombol "Add Contact" di halaman utama
   - React Router mengarahkan ke halaman Add Contact
   - Komponen AddContact ditampilkan dengan form kosong

2. **Tahap Pengisian**
   - Pengguna mengisi nama dan nomor telepon
   - State form diperbarui setiap ada perubahan input
   - Validasi dilakukan secara realtime

3. **Tahap Penyimpanan**
   - Pengguna mengklik tombol "Save"
   - Sistem melakukan validasi akhir
   - Data dikirim ke server melalui API
   - Indikator loading ditampilkan selama proses

4. **Tahap Akhir**
   - Jika berhasil: kembali ke halaman utama
   - Jika gagal: menampilkan pesan error
   - Form dikosongkan untuk input baru

Proses ini menggunakan fitur-fitur React modern seperti Hooks dan penanganan event untuk memberikan pengalaman yang baik dalam menambahkan kontak baru.

# 4. Proses Fitur Edit Contact dari mulai user mengklik button "Edit Contact" pada halaman utama dan kemudian mengklik tombol "Save" pada halaman Edit Contact  

Berikut adalah penjelasan detail proses edit kontak dari awal hingga akhir:

## 4.1. Komponen ContactCard (`frontend/src/components/ContactCard.js`)

1. **Inisialisasi State dan Props**
   ```javascript
   const ContactCard = ({ contact, onEdit, onDelete, onAvatarUpdate }) => {
     // State untuk mode edit
     const [isEditing, setIsEditing] = useState(false);
     // State untuk data form
     const [form, setForm] = useState({
       name: contact.name,
       phone: contact.phone
     });
   }
   ```
   - Menerima props `contact` yang berisi data kontak dan fungsi-fungsi callback
   - Membuat state `isEditing` untuk mengontrol mode tampilan (edit/normal)
   - Membuat state `form` yang diinisialisasi dengan data kontak saat ini

2. **Penanganan Mode Edit**
   ```javascript
   // Tombol Edit di tampilan normal
   <button onClick={() => setIsEditing(true)} aria-label="Edit contact">
     <BsPencilSquare />
   </button>

   // Tampilan form edit
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
     </div>
   ) : (
     // Tampilan normal
   )}
   ```
   - Saat tombol edit diklik, `setIsEditing(true)` mengaktifkan mode edit
   - Form edit ditampilkan dengan data kontak yang sudah ada
   - Input field terhubung dengan state `form` melalui `value` dan `onChange`

## 4.2. Proses Update Data (`MainPage.js`)

1. **Fungsi Handle Edit**
   ```javascript
   const handleEdit = async (id, updatedContact) => {
     if (!id) {
       console.error("No contact ID provided for deletion");
       return;
     }

     try {
       // Kirim data ke API
       await api.updateContact(id, updatedContact);

       // Cek apakah masih sesuai dengan pencarian
       if (search) {
         const searchLower = search.toLowerCase();
         const isStillMatching =
           updatedContact.name.toLowerCase().includes(searchLower) ||
           updatedContact.phone.toLowerCase().includes(searchLower);

         // Hapus dari list jika tidak sesuai pencarian
         if (!isStillMatching) {
           const filteredContacts = contacts.filter(
             (contact) => contact.id !== id
           );
           dispatch({ type: ACTIONS.SET_CONTACTS, payload: filteredContacts });
           return;
         }
       }

       // Update state kontak
       const updatedContacts = contacts.map((contact) =>
         contact.id === id ? { ...contact, ...updatedContact } : contact
       );
       dispatch({ type: ACTIONS.SET_CONTACTS, payload: updatedContacts });
       
       // Reload data
       loadContacts(false);
     } catch (error) {
       console.error("Error updating contact:", error);
     }
   };
   ```
   - Mengirim data update ke API
   - Memvalidasi hasil edit dengan filter pencarian yang aktif
   - Memperbarui state kontak di aplikasi
   - Menangani error jika terjadi masalah

2. **Integrasi dengan API**
   ```javascript
   // Di services/api.js
   const api = {
     updateContact: async (id, contact) => {
       try {
         const response = await axios.put(
           `${API_URL}/phonebooks/${id}`,
           contact
         );
         return response.data;
       } catch (error) {
         throw error;
       }
     }
   };
   ```
   - Mengirim request PUT ke endpoint API
   - Menyertakan ID kontak dan data yang diupdate
   - Mengembalikan response dari server

## 4.3. Alur Proses Lengkap

1. **Tahap Inisiasi Edit**
   - User mengklik tombol edit (ikon pensil) pada card kontak
   - State `isEditing` diubah menjadi true
   - Form edit ditampilkan dengan data kontak yang ada

2. **Tahap Pengisian Form**
   - User dapat mengubah nama dan nomor telepon
   - Setiap perubahan langsung diupdate ke state `form`
   - Validasi input dilakukan secara realtime

3. **Tahap Penyimpanan**
   - User mengklik tombol "Save"
   - Data dikirim ke server melalui API
   - State aplikasi diperbarui sesuai response
   - Mode edit dinonaktifkan jika berhasil

4. **Penanganan Khusus**
   - Jika sedang dalam mode pencarian:
     - Sistem mengecek apakah hasil edit masih sesuai filter
     - Kontak dihapus dari list jika tidak sesuai
   - Jika terjadi error:
     - Error ditampilkan di console
     - User tetap dalam mode edit

Proses ini menggunakan fitur-fitur React modern seperti Hooks dan penanganan event untuk memberikan pengalaman yang baik dalam menghapus kontak.

# 5. Proses Fitur Upload Avatar dari mulai user mengklik gambar avatar pada halaman utama

Proses fitur Upload Avatar terdiri dari beberapa tahapan:

1. **Inisiasi Upload Avatar**
   
   Proses dimulai dari komponen `ContactCard.js` ketika user mengklik gambar avatar:
   ```javascript
   const handleAvatarClick = () => {
     onAvatarUpdate(contact.id);
   };
   ```
   
   Di `MainPage.js`, fungsi ini akan mengarahkan ke halaman upload:
   ```javascript
   const handleAvatarUpdate = (id) => {
     navigate(`/avatar/${id}`);
   };
   ```

2. **Komponen AvatarUpload (`AvatarUpload.js`)**
   
   Komponen ini menginisialisasi beberapa state penting:
   ```javascript
   const [preview, setPreview] = useState(null);        // Preview gambar
   const [currentAvatar, setCurrentAvatar] = useState(null); // Avatar saat ini
   const [uploading, setUploading] = useState(false);   // Status upload
   const [error, setError] = useState('');             // Pesan error
   const fileInputRef = useRef(null);                  // Referensi input file
   ```

   Saat komponen dimuat, data avatar saat ini diambil:
   ```javascript
   useEffect(() => {
     const fetchContact = async () => {
       const contact = await api.getContactById(id);
       if (contact) {
         setCurrentAvatar(contact.photo);
       }
     };
     fetchContact();
   }, [id]);
   ```

3. **Metode Upload File**

   User dapat memilih file dengan 3 cara:
   
   a. **Drag & Drop**:
   ```javascript
   const handleDrop = (e) => {
     e.preventDefault();
     const file = e.dataTransfer.files[0];
     if (file) handleFileSelect(file);
   };
   ```
   
   b. **Pilih File Manual**:
   ```javascript
   const handleFileInput = (e) => {
     const file = e.target.files[0];
     if (file) handleFileSelect(file);
   };
   ```
   
   c. **Ambil Foto (Mobile)**:
   ```javascript
   const handleCapture = async () => {
     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
     // Proses pengambilan foto
   };
   ```

4. **Validasi File**

   Setiap file yang dipilih akan divalidasi:
   ```javascript
   const handleFileSelect = (file) => {
     // Validasi tipe file
     const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
     if (!validTypes.includes(file.type)) {
       setError('Pilih file gambar yang valid (JPG, PNG)');
       return;
     }

     // Validasi ukuran file (max 5MB)
     if (file.size > 5 * 1024 * 1024) {
       setError('Ukuran file harus kurang dari 5MB');
       return;
     }

     // Buat preview
     const reader = new FileReader();
     reader.onloadend = () => {
       setPreview(reader.result);
       setError('');
     };
     reader.readAsDataURL(file);
   };
   ```

5. **Proses Upload ke Server**

   Saat user mengklik tombol "Unggah Avatar":
   ```javascript
   const handleUpload = async () => {
     try {
       setUploading(true);
       
       // Konversi preview ke File
       const response = await fetch(preview);
       const blob = await response.blob();
       const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

       // Kirim ke server
       const formData = new FormData();
       formData.append('photo', file);
       await api.updateAvatar(id, formData);
       
       // Update UI dan redirect
       if (onAvatarUpdate) await onAvatarUpdate();
       navigate('/');
     } catch (err) {
       setError('Gagal mengunggah avatar. Silakan coba lagi.');
     } finally {
       setUploading(false);
     }
   };
   ```

6. **Penanganan Error dan Loading State**

   - Komponen menampilkan loading state saat proses upload
   - Error ditampilkan jika terjadi masalah dalam proses
   - User dapat membatalkan proses kapan saja dengan tombol "Batal"

7. **Fitur UI/UX**

   - Preview gambar real-time sebelum upload
   - Indikator visual saat drag & drop
   - Tombol untuk mengubah gambar setelah preview
   - Responsive design untuk desktop dan mobile
   - Opsi kamera khusus untuk perangkat mobile

# 6. Proses Fitur Delete Contact dari mulai user mengklik button "Delete Contact" pada halaman utama

Proses Delete Contact melibatkan beberapa komponen dan tahapan. Berikut adalah penjelasan detail untuk setiap tahapnya:

1. **Inisiasi Delete di ContactCard**

   Di `ContactCard.js`, proses dimulai saat user mengklik tombol Delete:
   ```javascript
   const ContactCard = ({ contact, onDelete }) => {
     const [showConfirm, setShowConfirm] = useState(false);
     
     const handleDelete = () => {
       setShowConfirm(true); // Menampilkan dialog konfirmasi
     };

     const confirmDelete = () => {
       onDelete(contact.id); // Memanggil fungsi delete dari parent
       setShowConfirm(false); // Menutup dialog
     };
   };
   ```
   - `showConfirm`: State untuk mengontrol visibilitas dialog konfirmasi
   - `handleDelete`: Menampilkan dialog konfirmasi sebelum penghapusan
   - `confirmDelete`: Mengeksekusi penghapusan setelah konfirmasi

2. **Penanganan di ContactList**

   `ContactList.js` meneruskan fungsi delete ke setiap ContactCard:
   ```javascript
   const ContactList = ({ contacts, onDelete }) => {
     return (
       <div className="contact-list">
         {contacts.map((contact) => (
           <ContactCard
             key={contact.id}
             contact={contact}
             onDelete={onDelete}
           />
         ))}
       </div>
     );
   };
   ```
   - Fungsi `onDelete` diteruskan dari MainPage ke setiap ContactCard
   - Setiap card menerima fungsi yang sama namun dengan ID kontak yang berbeda

3. **Proses Delete di MainPage**

   Di `MainPage.js`, menggunakan useContacts hook untuk mengelola state:
   ```javascript
   const MainPage = () => {
     const {
       state: { contacts },
       dispatch,
       loadContacts
     } = useContacts();

     const handleDelete = async (id) => {
       if (!id) {
         console.error("No contact ID provided for deletion");
         return;
       }

       try {
         await api.deleteContact(id);
         loadContacts(false); // Refresh daftar kontak
       } catch (error) {
         console.error("Error deleting contact:", error);
       }
     };
   };
   ```
   - Menggunakan `useContacts` hook untuk state management
   - `handleDelete`: Menangani proses penghapusan kontak
   - `loadContacts`: Me-refresh daftar kontak setelah penghapusan

4. **Integrasi dengan useContacts Hook**

   Di `useContacts.js`, terdapat action dan reducer untuk delete:
   ```javascript
   export const ACTIONS = {
     DELETE_CONTACT: 'delete_contact'
   };

   const contactReducer = (state, action) => {
     switch (action.type) {
       case ACTIONS.DELETE_CONTACT:
         return {
           ...state,
           contacts: state.contacts.filter(
             contact => contact.id !== action.payload
           )
         };
       // ... cases lainnya
     }
   };
   ```
   - Mendefinisikan action type untuk delete
   - Reducer memfilter kontak yang dihapus dari state

5. **Komunikasi dengan API**

   Di `api.js`, implementasi request delete ke backend:
   ```javascript
   const api = {
     deleteContact: async (id) => {
       try {
         const response = await axios.delete(
           `${API_URL}/phonebooks/${id}`
         );
         return response.data;
       } catch (error) {
         throw error;
       }
     }
   };
   ```
   - Mengirim DELETE request ke endpoint `/phonebooks/${id}`
   - Mengembalikan response data jika berhasil
   - Melempar error jika gagal

**Alur Proses Teknis:**

1. User mengklik tombol "Delete Contact" pada ContactCard
2. Dialog konfirmasi muncul (`setShowConfirm(true)`)
3. Jika user mengkonfirmasi:
   - `confirmDelete()` di ContactCard dipanggil
   - `onDelete(contact.id)` diteruskan ke ContactList
   - `handleDelete(id)` di MainPage dieksekusi
4. MainPage melakukan:
   - Memanggil `api.deleteContact(id)`
   - Menunggu response dari server
   - Memanggil `loadContacts(false)` untuk refresh data
5. useContacts hook:
   - Menerima data baru dari API
   - Memperbarui state global
   - Memicu re-render komponen terkait
6. UI diperbarui menampilkan daftar kontak tanpa item yang dihapus

Proses fitur Delete Contact ini menggunakan fitur-fitur React modern seperti Hooks dan penanganan event untuk memberikan pengalaman yang baik dalam menghapus kontak.

# 7. Proses Fitur Search Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama

Proses Search Contact melibatkan beberapa komponen dan tahapan. Berikut adalah penjelasan detail untuk setiap tahapnya:

1. **Inisiasi Search di SearchBar**

   Di `SearchBar.js`, proses dimulai saat user mengetik di field search:
   ```javascript
   const SearchBar = ({ value = "", onChange }) => {
     const handleSearchChange = (e) => {
       const newSearch = e.target.value;
       onChange(newSearch); // Memanggil handleSearch di MainPage
     };

     return (
       <input
         type="text"
         value={value}
         onChange={handleSearchChange}
         placeholder="Search contacts..."
         className="search-input"
       />
     );
   };
   ```
   - `value`: Nilai search dari MainPage
   - `onChange`: Callback function untuk update nilai search
   - `handleSearchChange`: Menangani perubahan input search

2. **Penanganan di MainPage**

   `MainPage.js` menggunakan useContacts hook untuk state management:
   ```javascript
   const MainPage = () => {
     const {
       state: { contacts, search },
       handleSearch,
       loadContacts
     } = useContacts();

     useEffect(() => {
       loadContacts(false);
     }, [search]);

     return (
       <SearchBar
         value={search}
         onChange={handleSearch}
       />
     );
   };
   ```
   - Menggunakan `useContacts` hook untuk state management
   - `handleSearch`: Memperbarui state pencarian
   - `loadContacts`: Me-refresh daftar kontak setelah pencarian

3. **State Management dengan useContacts Hook**

   Di `useContacts.js`, logika pencarian diimplementasikan:
   ```javascript
   const ContactProvider = ({ children }) => {
     const [state, dispatch] = useReducer(contactReducer, initialState);

   const handleSearch = useCallback((value) => {
     dispatch({ type: ACTIONS.SET_SEARCH, payload: value });
   }, []);

     useEffect(() => {
       const fetchData = async () => {
         await loadContacts(false);
       };
       fetchData();
     }, [state.search]); // Re-fetch saat search berubah
   };
   ```
   - `handleSearch`: Memperbarui state pencarian
   - `useEffect`: Memicu pencarian ulang saat search berubah
   - `loadContacts`: Me-refresh daftar kontak setelah pencarian

4. **Integrasi dengan API**

   Di `api.js`, request pencarian ke backend:
   ```javascript
   const api = {
     getContacts: async (
       page = 1,
       limit = 10,
       sortBy = "name",
       sortOrder = "asc",
       search = ""
     ) => {
       try {
         const response = await axios.get(`${API_URL}/phonebooks`, {
           params: { page, limit, sortBy, sortOrder, name: search }
         });
         return response.data;
       } catch (error) {
         throw error;
       }
     }
   };
   ```
   - Mengirim parameter search ke API
   - Menangani pagination dan sorting
   - Mengembalikan hasil pencarian

**Alur Proses Teknis:**

1. User mengetik keyword di search field
   - Event `onChange` di SearchBar dipanggil
   - `handleSearchChange` mengirim nilai baru ke parent

2. MainPage menerima perubahan
   - `handleSearch` dari useContacts dipanggil
   - State search diperbarui
   - `loadContacts` dipanggil untuk data baru

3. useContacts Hook bereaksi
   - `useEffect` mendeteksi perubahan search
   - Memanggil `loadContacts` untuk data baru

4. Proses Fetch Data
   - Request GET ke API dengan parameter search
   - API memproses pencarian di backend
   - Data hasil pencarian diterima

5. Update UI
   - State contacts diperbarui dengan hasil pencarian
   - Loading state dinonaktifkan
   - Daftar kontak dirender ulang
   - Error ditampilkan jika ada

6. Persistensi State
   - Query pencarian disimpan di sessionStorage
   - State aktif pencarian dipertahankan
   - State dipulihkan saat reload halaman


# 8. Proses Fitur Search, Sorting, dan Edit Contact dari mulai user menginput keyword pada field "Search Contact" pada halaman utama dan mengklik sort button dan juga mengklik tombol edit pada halaman utama

## 1. Inisialisasi Komponen

**File: @frontend/src/components/MainPage.js**

```javascript
import React from 'react';
import { useContacts } from '../hooks/useContacts';
import SearchBar from './SearchBar';
import SortButton from './SortButton';
import ContactList from './ContactList';

const MainPage = () => {
  const { state, handleSearch, handleSort } = useContacts();

  return (
    <div>
      <SearchBar value={state.search} onChange={handleSearch} />
      <SortButton sortOrder={state.sortOrder} onSort={handleSort} />
      <ContactList contacts={state.contacts} />
    </div>
  );
};
```

1. MainPage mengimpor komponen-komponen yang diperlukan dan hook useContacts.
2. useContacts menyediakan state dan fungsi-fungsi untuk mengelola kontak.
3. SearchBar, SortButton, dan ContactList dirender dengan props yang sesuai.

## 2. Implementasi Search

**File: @frontend/src/components/SearchBar.js**

```javascript
import React from 'react';

const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search contacts..."
    />
  );
};
```

1. SearchBar menerima value dan onChange sebagai props.
2. Setiap perubahan input akan memanggil onChange dengan nilai baru.

## 3. Implementasi Sort

**File: @frontend/src/components/SortButton.js**

```javascript
import React from 'react';

const SortButton = ({ sortOrder, onSort }) => {
  return (
    <button onClick={() => onSort(sortOrder === 'asc' ? 'desc' : 'asc')}>
      Sort {sortOrder === 'asc' ? '▲' : '▼'}
    </button>
  );
};
```

1. SortButton menerima sortOrder dan onSort sebagai props.
2. Klik pada button akan memanggil onSort dengan nilai yang dibalik.

## 4. Pengelolaan State di useContacts Hook

**File: @frontend/src/hooks/useContacts.js**

```javascript
import { useReducer, useEffect } from 'react';
import api from '../services/api';

const useContacts = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSearch = (searchTerm) => {
    dispatch({ type: 'SET_SEARCH', payload: searchTerm });
  };

  const handleSort = (sortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder });
  };

  useEffect(() => {
    loadContacts();
  }, [state.search, state.sortOrder]);

  const loadContacts = async () => {
    try {
      const response = await api.getContacts(state.search, state.sortOrder);
      dispatch({ type: 'SET_CONTACTS', payload: response.data });
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  return { state, handleSearch, handleSort };
};
```

1. useContacts menggunakan useReducer untuk mengelola state kompleks.
2. handleSearch dan handleSort memperbarui state melalui dispatch.
3. useEffect memicu loadContacts setiap kali search atau sortOrder berubah.
4. loadContacts mengambil data dari API berdasarkan state saat ini.

## Alur Proses Teknis:

1. User mengetik keyword di search field atau mengklik tombol sort.
   - `onChange` dan `onSort` di SearchBar dan SortButton dipanggil.
   - `handleSearch` dan `handleSort` dari `useContacts` dipanggil.
   - State search dan sortOrder diperbarui.

2. MainPage bereaksi terhadap perubahan.
   - `useEffect` mendeteksi perubahan search atau sortOrder.
   - Memanggil `loadContacts` untuk memuat data baru.

3. useContacts Hook mengelola state.
   - `handleSearch` dan `handleSort` mengubah state di reducer.
   - Data kontak diperbarui dan dirender ulang berdasarkan pencarian dan urutan yang baru.

4. User dapat mengedit kontak di halaman utama.
   - Klik tombol edit membuka form edit.
   - Perubahan disimpan dan state diperbarui.

# 9. Proses Fitur Edit Contact dapat dilakukan perubahaan secara bersamaan di halaman utama
Fitur Edit Contact memungkinkan pengguna untuk mengubah informasi kontak langsung di halaman utama. Berikut adalah penjelasan detail proses ini:

## 1. Inisialisasi Mode Edit

**File: @frontend/src/components/ContactCard.js**

```javascript
const ContactCard = ({ contact, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: contact.name, phone: contact.phone });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // ...
}
```

1. `useState` digunakan untuk mengelola state `isEditing` dan `editForm`.
2. `isEditing` menentukan apakah kartu kontak dalam mode edit.
3. `editForm` menyimpan data sementara selama proses edit.
4. `handleEditClick` mengaktifkan mode edit ketika tombol edit diklik.

## 2. Render Komponen Berdasarkan Mode

```javascript
return (
  <div className="contact-card">
    {isEditing ? (
      <EditForm 
        form={editForm} 
        setForm={setEditForm} 
        onSave={() => {
          onEdit(contact.id, editForm);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    ) : (
      <>
        <div>{contact.name}</div>
        <div>{contact.phone}</div>
        <button onClick={handleEditClick}>Edit</button>
      </>
    )}
  </div>
);
```

1. Komponen merender `EditForm` jika `isEditing` true, atau tampilan normal jika false.
2. `EditForm` menerima props untuk mengelola form dan aksi simpan/batal.
3. Ketika edit disimpan, `onEdit` dipanggil dengan ID kontak dan data baru.

## 3. Implementasi Form Edit

**File: @frontend/src/components/EditForm.js**

```javascript
const EditForm = ({ form, setForm, onSave, onCancel }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};
```

1. `EditForm` menangani perubahan input dan submission form.
2. `handleChange` memperbarui state form setiap kali input berubah.
3. Ketika form di-submit, `onSave` dipanggil untuk memproses perubahan.

## 4. Penanganan Edit di MainPage

**File: @frontend/src/components/MainPage.js**

```javascript
const MainPage = () => {
  const { state, handleEdit } = useContacts();

  const onEdit = async (id, updatedContact) => {
    try {
      await handleEdit(id, updatedContact);
      // Mungkin perlu memperbarui UI atau memberikan feedback
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  return (
    <div>
      {state.contacts.map(contact => (
        <ContactCard 
          key={contact.id} 
          contact={contact} 
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
```

1. `useContacts` hook digunakan untuk mengakses state global dan fungsi `handleEdit`.
2. `onEdit` memanggil `handleEdit` dari `useContacts` untuk memproses perubahan.
3. Setiap `ContactCard` menerima prop `onEdit` untuk menangani perubahan.

## 5. Implementasi Edit di useContacts Hook

**File: @frontend/src/hooks/useContacts.js**

```javascript
const useContacts = () => {
  // ...

  const handleEdit = async (id, updatedContact) => {
    try {
      const response = await api.updateContact(id, updatedContact);
      dispatch({ type: 'UPDATE_CONTACT', payload: response.data });
    } catch (error) {
      throw error;
    }
  };

  // ...
};
```

1. `handleEdit` mengirim permintaan update ke API.
2. Setelah berhasil, dispatch action 'UPDATE_CONTACT' untuk memperbarui state.
3. Jika terjadi error, error dilempar kembali untuk ditangani di komponen.

## Alur Proses Teknis:

1. Inisiasi Pencarian:
   - User mengetik keyword di SearchBar
   - `handleSearchChange` menangkap input
   - `onChange` meneruskan nilai ke MainPage
   - `handleSearch` memperbarui state global
   - State pencarian disimpan ke sessionStorage

2. Tampilan Hasil Pencarian:
   - useContacts memuat data sesuai keyword
   - ContactList menampilkan hasil pencarian
   - UI diperbarui secara real-time

3. Navigasi ke Add Contact:
   - User mengklik tombol "Add Contact"
   - `handleAddClick` dipanggil
   - navigate('/add') dijalankan
   - Halaman add contact ditampilkan

4. Kembali ke Hasil Pencarian:
   - User mengklik tombol Cancel
   - `handleCancel` mengambil state pencarian
   - navigate dengan query search
   - MainPage memulihkan state pencarian
   - Hasil pencarian sebelumnya ditampilkan kembali

Proses ini memastikan pengalaman pengguna yang mulus dengan mempertahankan state pencarian saat navigasi antar halaman.

# 10. Proses Fitur searching dan sorting
Proses Fitur Searching dan Sorting di Halaman Utama

## 1. Inisialisasi Komponen

**File: @frontend/src/components/MainPage.js**

```javascript
import React from 'react';
import { useContacts } from '../hooks/useContacts';
import SearchBar from './SearchBar';
import SortButton from './SortButton';
import ContactList from './ContactList';

const MainPage = () => {
  const { state, handleSearch, handleSort } = useContacts();

  return (
    <div>
      <SearchBar 
        value={state.search}
        onChange={handleSearch}
      />
      <SortButton 
        sortOrder={state.sortOrder}
        onSort={handleSort}
      />
      <ContactList 
        contacts={state.contacts}
      />
    </div>
  );
};
```

1. MainPage mengimpor komponen-komponen yang diperlukan dan hook useContacts.
2. useContacts menyediakan state dan fungsi-fungsi untuk mengelola kontak.
3. SearchBar, SortButton, dan ContactList dirender dengan props yang sesuai.

## 2. Implementasi Search

**File: @frontend/src/components/SearchBar.js**

```javascript
import React from 'react';

const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search contacts..."
    />
  );
};
```

1. SearchBar menerima value dan onChange sebagai props.
2. Setiap perubahan input akan memanggil onChange dengan nilai baru.

## 3. Implementasi Sort

**File: @frontend/src/components/SortButton.js**

```javascript
import React from 'react';

const SortButton = ({ sortOrder, onSort }) => {
  return (
    <button onClick={() => onSort(sortOrder === 'asc' ? 'desc' : 'asc')}>
      Sort {sortOrder === 'asc' ? '▲' : '▼'}
    </button>
  );
};
```

1. SortButton menerima sortOrder dan onSort sebagai props.
2. Klik pada button akan memanggil onSort dengan nilai yang dibalik.

## 4. Pengelolaan State di useContacts Hook

**File: @frontend/src/hooks/useContacts.js**

```javascript
import { useReducer, useEffect } from 'react';
import api from '../services/api';

const useContacts = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSearch = (searchTerm) => {
    dispatch({ type: 'SET_SEARCH', payload: searchTerm });
  };

  const handleSort = (sortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder });
  };

  useEffect(() => {
    loadContacts();
  }, [state.search, state.sortOrder]);

  const loadContacts = async () => {
    try {
      const response = await api.getContacts(state.search, state.sortOrder);
      dispatch({ type: 'SET_CONTACTS', payload: response.data });
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  return { state, handleSearch, handleSort };
};
```

1. useContacts menggunakan useReducer untuk mengelola state kompleks.
2. handleSearch dan handleSort memperbarui state melalui dispatch.
3. useEffect memicu loadContacts setiap kali search atau sortOrder berubah.
4. loadContacts mengambil data dari API berdasarkan state saat ini.

## Alur Proses Teknis:

1. User mengetik keyword di search field atau mengklik tombol sort.
   - `onChange` dan `onSort` di SearchBar dan SortButton dipanggil.
   - `handleSearch` dan `handleSort` dari `useContacts` dipanggil.
   - State search dan sortOrder diperbarui.

2. MainPage bereaksi terhadap perubahan.
   - `useEffect` mendeteksi perubahan search atau sortOrder.
   - Memanggil `loadContacts` untuk memuat data baru.

3. useContacts Hook mengelola state.
   - `handleSearch` dan `handleSort` mengubah state di reducer.
   - Data kontak diperbarui dan dirender ulang berdasarkan pencarian dan urutan yang baru.

4. User dapat mengedit kontak di halaman utama.
   - Klik tombol edit membuka form edit.
   - Perubahan disimpan dan state diperbarui.

# 11. Proses Fitur Searching Contact dan muncul data yang di searching berdasarkan keyword, setelah itu klik button 'add contact' dan muncul halaman add contact, selanjutnya, klik cancel dan kembali ke halaman sebelumnya yaitu halaman searching yang tadi

## A. Proses Pencarian dan Tampilan Hasil

**File: @frontend/src/components/SearchBar.js**
```javascript
const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={handleSearchChange}
        placeholder="Search contacts..."
        className="search-input"
      />
      <button onClick={onAdd} className="add-button">
        Add Contact
      </button>
    </div>
  );
};
```

1. User mengetik keyword di field search
2. `handleSearchChange` menangkap perubahan input
3. Nilai search diteruskan ke MainPage melalui `onChange`

## B. Penanganan State Pencarian

**File: @frontend/src/components/MainPage.js**
```javascript
const MainPage = () => {
  const navigate = useNavigate();
  const {
    state: { contacts, search },
    handleSearch,
  } = useContacts();

  useEffect(() => {
    // Menyimpan state pencarian ke session storage
    if (search) {
      sessionStorage.setItem('contactSearch', search);
      sessionStorage.setItem('searchActive', 'true');
    }
  }, [search]);

  const handleAddClick = () => {
    navigate('/add');
  };

  return (
    <div>
      <SearchBar 
        value={search}
        onChange={handleSearch}
        onAdd={handleAddClick}
      />
      <ContactList contacts={contacts} />
    </div>
  );
};
```

1. `handleSearch` dari useContacts memperbarui state pencarian
2. State pencarian disimpan ke sessionStorage
3. Hasil pencarian ditampilkan melalui ContactList
4. Tombol "Add Contact" mengarahkan ke halaman add

## C. Navigasi ke Add Contact dan Kembali

**File: @frontend/src/components/AddContact.js**
```javascript
const AddContact = ({ onAdd }) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    // Mengambil state pencarian sebelumnya
    const search = sessionStorage.getItem('contactSearch');
    const isSearchActive = sessionStorage.getItem('searchActive');

    // Kembali ke halaman utama dengan state pencarian
    if (isSearchActive && search) {
      navigate(`/?search=${search}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form>
      {/* Form fields */}
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
};
```

1. Saat tombol Cancel diklik, `handleCancel` dijalankan
2. Mengambil state pencarian dari sessionStorage
3. Navigasi kembali ke halaman utama dengan query search

## Alur Proses Teknis:

1. Inisiasi Pencarian:
   - User mengetik keyword di SearchBar
   - `handleSearchChange` menangkap input
   - `onChange` meneruskan nilai ke MainPage
   - `handleSearch` memperbarui state global
   - State pencarian disimpan ke sessionStorage

2. Tampilan Hasil Pencarian:
   - useContacts memuat data sesuai keyword
   - ContactList menampilkan hasil pencarian
   - UI diperbarui secara real-time

3. Navigasi ke Add Contact:
   - User mengklik tombol "Add Contact"
   - `handleAddClick` dipanggil
   - navigate('/add') dijalankan
   - Halaman add contact ditampilkan

4. Kembali ke Hasil Pencarian:
   - User mengklik tombol Cancel
   - `handleCancel` mengambil state pencarian
   - navigate dengan query search
   - MainPage memulihkan state pencarian
   - Hasil pencarian sebelumnya ditampilkan kembali

Proses ini memastikan pengalaman pengguna yang mulus dengan mempertahankan state pencarian saat navigasi antar halaman.

{{ ... }}
