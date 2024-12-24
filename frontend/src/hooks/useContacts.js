import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useContacts = () => {
  // State untuk menyimpan daftar kontak
  const [contacts, setContacts] = useState([]);
  // State untuk menandai apakah sedang dalam proses loading
  const [loading, setLoading] = useState(false);
  // State untuk menyimpan pesan error jika terjadi kesalahan
  const [error, setError] = useState(null);
  // State untuk menyimpan nomor halaman saat ini
  const [page, setPage] = useState(1);
  // State untuk menandai apakah masih ada data kontak yang bisa dimuat
  const [hasMore, setHasMore] = useState(true);
  // State untuk menyimpan kriteria pengurutan (defaultnya berdasarkan nama)
  const [sortBy, setSortBy] = useState('name');
  // State untuk menyimpan urutan pengurutan (defaultnya ascending)
  const [sortOrder, setSortOrder] = useState('asc');
  // State untuk menyimpan kata kunci pencarian, diinisialisasi dari sessionStorage
  const [search, setSearch] = useState(() => {
    const savedSearch = sessionStorage.getItem('contactSearch');
    const isActive = sessionStorage.getItem('searchActive');
    return isActive ? (savedSearch || '') : '';
  });

  // Fungsi untuk mengatur pencarian
  const handleSearch = useCallback((value) => {
    setSearch(value);
    sessionStorage.setItem('contactSearch', value || '');
    if (value) {
      sessionStorage.setItem('searchActive', 'true');
    } else {
      sessionStorage.removeItem('searchActive');
    }
  }, []);

  // Effect untuk menyimpan kata kunci pencarian ke sessionStorage setiap kali berubah
  useEffect(() => {
    sessionStorage.setItem('contactSearch', search);
    //console.log('Search value saved to sessionStorage:', sessionStorage.getItem('contactSearch'));
  }, [search]);

  // Fungsi untuk memuat kontak dari API
  const loadContacts = useCallback(async (loadMore = false) => {
    if (loading) return; // Jika sedang loading, hentikan eksekusi

    setLoading(true);
    try {
      // Tentukan halaman yang akan dimuat
      const currentPage = loadMore ? page + 1 : 1;
      // Panggil API untuk mendapatkan kontak
      const { phonebooks, ...pagination } = await api.getContacts(currentPage, 10, sortBy, sortOrder, search);

      //console.log('API Response Search:', search);

      if (Array.isArray(phonebooks)) {
        if (loadMore) {
          // Jika memuat lebih banyak, tambahkan kontak baru yang belum ada
          setContacts(prev => {
            const existingIds = new Set(prev.map(contact => contact.id));
            const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
            return [...prev, ...newContacts];
          });
        } else {
          // Jika memuat ulang atau mengubah filter, ganti semua kontak
          setContacts(phonebooks);
        }
        
        // Update state terkait paginasi
        setHasMore(currentPage < pagination.pages);
        setPage(currentPage);
        console.log('API Response UseContacts:', phonebooks);
        
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      setError(err.message || 'Error fetching contacts');
    } finally {
      setLoading(false);
    }
  }, [loading, page, sortBy, sortOrder, search]);

  // Effect untuk memuat ulang kontak ketika kriteria pencarian berubah
  useEffect(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts(false); // Muat ulang kontak dari awal
    console.log(search);
  }, [sortBy, sortOrder, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fungsi untuk me-refresh daftar kontak
  const refreshContacts = useCallback(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts(false); // Muat ulang kontak dari awal
  }, [loadContacts]);

  // Mengembalikan objek dengan semua state dan fungsi yang diperlukan
  return {
    contacts,
    loading,
    error,
    hasMore,
    sortBy,
    sortOrder,
    search,
    setSearch: handleSearch,
    setSortBy,
    setSortOrder,
    setContacts,
    loadMore: () => loadContacts(true),
    refreshContacts
  };
};

// Penjelasan, Alur, dan Logika:

// 1. Penjelasan:
//    - Hook useContacts adalah custom hook untuk mengelola data kontak.
//    - Hook ini menangani state untuk daftar kontak, loading, error, paginasi, pengurutan, dan pencarian.
//    - Menyediakan fungsi-fungsi untuk memuat, memperbarui, dan me-refresh data kontak.

// 2. Alur:
//    a. Inisialisasi state dan fungsi-fungsi terkait.
//    b. Saat komponen yang menggunakan hook ini di-mount, kontak dimuat dari API.
//    c. Pengguna dapat melakukan pencarian, mengubah pengurutan, atau memuat lebih banyak kontak.
//    d. Setiap perubahan pada kriteria pencarian atau pengurutan memicu pemuatan ulang kontak.
//    e. Kontak dapat di-refresh kapan saja menggunakan fungsi refreshContacts.

// 3. Logika:
//    - Menggunakan callbacks untuk optimasi performa dan menghindari re-render yang tidak perlu.
//    - Mengelola state loading untuk mencegah multiple API calls bersamaan.
//    - Menggunakan sessionStorage untuk menyimpan state pencarian, memungkinkan persistensi setelah refresh halaman.
//    - Menerapkan paginasi dengan infinite scrolling menggunakan state hasMore.
//    - Menggabungkan kontak baru dengan yang sudah ada saat memuat lebih banyak data, menghindari duplikasi.

// 4. Keterhubungan dengan Backend:
//    - Menggunakan modul api untuk berkomunikasi dengan backend.
//    - Fungsi loadContacts memanggil api.getContacts untuk mengambil data kontak dari server.
//    - Parameter seperti halaman, jumlah item per halaman, pengurutan, dan kata kunci pencarian dikirim ke backend.
//    - Backend mengembalikan data kontak beserta informasi paginasi yang digunakan untuk mengatur state di frontend.
//    - Error dari backend ditangkap dan disimpan dalam state error untuk ditampilkan ke pengguna jika diperlukan.

// Hook ini menyediakan abstraksi yang kuat untuk manajemen data kontak, memungkinkan komponen-komponen React 
// untuk dengan mudah mengakses dan memanipulasi data kontak tanpa perlu mengetahui detail implementasi 
// atau interaksi dengan backend.