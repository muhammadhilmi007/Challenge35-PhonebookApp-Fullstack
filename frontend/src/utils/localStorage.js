/**
 * Kunci untuk menyimpan data di localStorage
 */
const PENDING_CONTACTS_KEY = 'pendingContacts';
const OFFLINE_CONTACTS_KEY = 'offlineContacts';

/**
 * Utilitas untuk mengelola penyimpanan kontak di localStorage
 * Menyediakan fungsi-fungsi untuk:
 * - Menyimpan dan mengambil kontak offline
 * - Mengelola kontak yang pending (belum tersinkronisasi dengan server)
 * - Membersihkan data kontak
 */
export const localStorageUtil = {
  /**
   * Mengambil semua kontak dari localStorage
   * @returns {Array} Daftar kontak yang tersimpan
   */
  getAllContacts: () => {
    const offlineContacts = localStorage.getItem(OFFLINE_CONTACTS_KEY);
    return offlineContacts ? JSON.parse(offlineContacts) : [];
  },

  /**
   * Menyimpan semua kontak ke localStorage
   * Digunakan saat aplikasi offline atau sebagai cache
   * @param {Array} contacts - Daftar kontak yang akan disimpan
   */
  saveAllContacts: (contacts) => {
    localStorage.setItem(OFFLINE_CONTACTS_KEY, JSON.stringify(contacts));
  },

  /**
   * Mengambil daftar kontak yang masih pending
   * Kontak pending adalah kontak yang belum tersinkronisasi dengan server
   * @returns {Array} Daftar kontak pending
   */
  getPendingContacts: () => {
    const pendingContacts = localStorage.getItem(PENDING_CONTACTS_KEY);
    return pendingContacts ? JSON.parse(pendingContacts) : [];
  },

  /**
   * Menambahkan kontak ke daftar pending
   * @param {Object} contact - Data kontak yang akan ditambahkan
   * @returns {Object} Kontak yang telah ditambahkan dengan ID sementara
   */
  addPendingContact: (contact) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const newContact = {
      ...contact,
      id: `pending_${Date.now()}`, // ID sementara untuk kontak pending
      status: 'pending'
    };
    pendingContacts.unshift(newContact); // Tambahkan ke awal array
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(pendingContacts));
    return newContact;
  },

  /**
   * Menghapus kontak dari daftar pending
   * Dipanggil setelah kontak berhasil disinkronkan dengan server
   * @param {string} pendingId - ID kontak pending yang akan dihapus
   */
  removePendingContact: (pendingId) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const updatedContacts = pendingContacts.filter(contact => contact.id !== pendingId);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(updatedContacts));
  },

  /**
   * Membersihkan semua kontak offline
   * Berguna saat ingin mereset cache atau membersihkan data
   */
  clearOfflineContacts: () => {
    localStorage.removeItem(OFFLINE_CONTACTS_KEY);
  }
};
