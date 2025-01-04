// Mengimpor modul dan komponen yang diperlukan
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import MainPage from "./components/MainPage";
import { api } from "./services/api";
import './App.css';
import "./styles/styles.css";

// 1.1 Aplikasi dimulai dengan setup Router
const App = () => {
  // !! State Management addContact
  // 5.9 Fungsi untuk menambah kontak baru
  const handleAdd = async (contact) => {
    try {
      // Memanggil API untuk menambah kontak
      await api.addContact(contact);
    } catch (error) {
      console.log("Error adding contact:", error);
      throw error;
    }
  };

  // Render komponen App dengan routing
  return (
    <Router>
      <Routes>
        {/* 1.2 MainPage dirender sebagai Halaman utama */}
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddContact onAdd={handleAdd} />} />
        <Route path="/avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </Router>
  );
};

// Ekspor komponen App sebagai default
export default App;

/*
Penjelasan, Alur, dan Logika:

1. Struktur Aplikasi:
   - Aplikasi ini adalah sebuah aplikasi manajemen kontak yang dibangun menggunakan React.
   - Terdiri dari beberapa komponen utama: MainPage, AddContact, dan AvatarUpload.
   - Menggunakan React Router untuk navigasi antar halaman.

2. Komponen MainPage:
   - Merupakan halaman utama yang menampilkan daftar kontak.
   - Menggunakan custom hook 'useContacts' untuk mengelola state dan operasi terkait kontak.
   - Menyediakan fitur pencarian, pengurutan, dan infinite scrolling untuk daftar kontak.
   - Memungkinkan pengguna untuk mengedit, menghapus, dan memperbarui avatar kontak.

3. Manajemen State:
   - Menggunakan custom hook 'useContacts' untuk centralized state management.
   - State meliputi daftar kontak, status loading, error, pencarian, dan pengurutan.

4. Interaksi dengan Backend:
   - Menggunakan modul 'api' untuk berkomunikasi dengan backend.
   - Operasi CRUD (Create, Read, Update, Delete) pada kontak dilakukan melalui API calls.
   - Pencarian dan pengurutan dilakukan di sisi client untuk responsivitas yang lebih baik.

5. Fitur Pencarian:
   - Pencarian real-time pada daftar kontak.
   - Hasil pencarian disimpan di sessionStorage untuk persistensi selama sesi.

6. Penanganan Avatar:
   - Fitur khusus untuk memperbarui avatar kontak melalui halaman terpisah.

7. Routing:
   - Menggunakan React Router untuk navigasi antar halaman tanpa refresh penuh.
   - Terdapat rute untuk halaman utama, tambah kontak, dan update avatar.

8. Optimasi Performa:
   - Implementasi infinite scrolling untuk memuat kontak secara bertahap.
   - Pencarian dan pengurutan dilakukan secara lokal untuk UX yang lebih responsif.

Alur Aplikasi:
1. Aplikasi dimulai dengan merender komponen App.
2. Pengguna diarahkan ke halaman utama (MainPage) yang menampilkan daftar kontak.
3. Pengguna dapat melakukan pencarian, pengurutan, atau scroll untuk memuat lebih banyak kontak.
4. Untuk menambah kontak baru, pengguna diarahkan ke halaman AddContact.
5. Untuk mengedit atau menghapus kontak, pengguna dapat melakukannya langsung dari daftar kontak.
6. Untuk memperbarui avatar, pengguna diarahkan ke halaman AvatarUpload.

Keterhubungan dengan Backend:
1. API Calls:
   - Semua operasi CRUD menggunakan fungsi dari modul 'api' yang berkomunikasi dengan backend.
   - Operasi GET untuk mengambil daftar kontak dan detil kontak.
   - Operasi POST untuk menambah kontak baru.
   - Operasi PUT/PATCH untuk memperbarui kontak yang ada.
   - Operasi DELETE untuk menghapus kontak.

2. Manajemen State:
   - State lokal di-sync dengan data dari backend melalui API calls.
   - Perubahan pada frontend (seperti edit atau hapus) langsung dikirim ke backend.

3. Error Handling:
   - Kesalahan dari backend ditangkap dan ditampilkan ke pengguna.
   - Menggunakan try-catch untuk menangani error pada setiap operasi API.

4. Optimasi:
   - Implementasi infinite scrolling untuk mengurangi beban pada backend dengan memuat data secara bertahap.
   - Pencarian dan pengurutan dilakukan di sisi client untuk mengurangi beban server, dengan asumsi jumlah data tidak terlalu besar.

Aplikasi ini mendemonstrasikan penggunaan React modern dengan hooks, custom hooks untuk manajemen state, dan integrasi yang baik dengan backend melalui API. Struktur dan organisasi kode memungkinkan untuk skalabilitas dan pemeliharaan yang mudah.
*/
