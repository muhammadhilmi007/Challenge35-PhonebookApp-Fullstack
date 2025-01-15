# 1. Proses `npm start` di React
Ketika menjalankan perintah `npm start`:
1. React akan menjalankan script start yang didefinisikan di package.json
2. Development server akan dijalankan (biasanya di port 3000)
3. Webpack akan melakukan bundling semua file JavaScript dan asset
4. Index.js akan di-load pertama kali, yang kemudian me-render App component
5. React akan menginisialisasi ContactContext Provider yang menyediakan state management

# 2. Proses Menampilkan Halaman Main Page setelah npm start
1. App.js di-render pertama kali
2. ContactContext Provider diinisialisasi dengan state awal:
   - contacts: []
   - loading: false
   - page: 1
   - sortBy: dari session storage
   - search: dari session storage
3. MainPage component di-render
4. useEffect di MainPage dijalankan untuk:
   - Mengambil data kontak dari API
   - Menyimpan data ke state melalui reducer
   
   ```javascript
   // MainPage.js
   const MainPage = () => {
     const { 
       state, 
       loadContacts,
       handleSearch,
       handleSort,
       handleEdit,
       handleDelete,
       handleResendSuccess,
       handleRefreshContacts
     } = useContactContext();

     // Effect untuk load contacts saat search atau sort berubah
     useEffect(() => {
       loadContacts(false);
     }, [state.sortBy, state.sortOrder, state.search]); 

     // Effect untuk manage search parameters di session storage
     useEffect(() => {
       const searchParams = new URLSearchParams(location.search);
       const sessionParams = ["search", "sortBy", "sortOrder"];
       // Update session storage saat parameter URL berubah
     }, [location.search]);
   };
   ```

   Penjelasan:
   - useEffect pertama akan dijalankan setiap kali ada perubahan pada state.sortBy, state.sortOrder, atau state.search
   - loadContacts(false) memanggil API untuk mendapatkan data kontak dengan parameter sort dan search terbaru
   - Parameter false menandakan bahwa ini bukan load more (pagination) melainkan load data baru
   - Data yang didapat dari API akan disimpan ke state melalui reducer di ContactContext

   Parameter loadContacts(true) digunakan saat:
   ```javascript
   <ContactList
     contacts={state.contacts}
     loading={state.loading}
     hasMore={state.hasMore && !state.isOffline}
     onLoadMore={() => loadContacts(true)}  // Infinite scrolling
     onEdit={handleEdit}
     onDelete={handleDelete}
     onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
   />
   ```

   - loadContacts(true) dipanggil saat user melakukan scroll ke bawah dan mencapai batas list (infinite scrolling)
   - Parameter true menandakan bahwa ini adalah permintaan untuk memuat data tambahan (load more)
   - Data baru akan ditambahkan ke list yang sudah ada, bukan menggantikan data yang ada
   - Pagination dihandle di server side dengan parameter page yang diincrement setiap kali loadContacts(true) dipanggil


# 3. Proses Menampilkan Halaman Add Contact
1. User mengklik tombol "Add Contact"

   ```javascript
   // SearchBar.js - Implementasi tombol Add Contact
   const SearchBar = ({ onAdd }) => {
     return (
       <div className="search-bar">
         {/* ... kode lainnya ... */
         
         {/* Add Contact Button */}
         <button 
           className="add-button" 
           onClick={onAdd}  // Memanggil fungsi yang dikirim dari MainPage
           aria-label="Add new contact"
         >
           <BsFillPersonPlusFill />  // Icon plus dari react-icons
         </button>
       </div>
     );
   };
   ```

2. React Router mengarahkan ke halaman AddContact
   ```javascript
   // MainPage.js - Mengirim fungsi navigasi ke SearchBar
   const MainPage = () => {
     const navigate = useNavigate();  // Hook dari react-router-dom
     
     return (
       <div className="app">
         <SearchBar
           value={state.search}
           onChange={handleSearch}
           onSort={handleSort}
           onAdd={() => navigate("/add")}  // Fungsi untuk navigasi ke /add
         />
       </div>
     );
   };

   // App.js - Konfigurasi route untuk AddContact
   const App = () => {
     return (
       <ContactProvider>
         <Router>
           <Routes>
             <Route path="/add" element={<AddContact />} />  {/* Route untuk Add Contact */}
           </Routes>
         </Router>
       </ContactProvider>
     );
   };
   ```

   Penjelasan alur:
   1. Di SearchBar.js terdapat tombol Add Contact yang menerima prop onAdd
   2. Saat tombol diklik, fungsi onAdd akan dipanggil
   3. Di MainPage.js, onAdd didefinisikan sebagai fungsi yang memanggil navigate("/add")
   4. React Router akan mencocokkan path "/add" yang sudah didefinisikan di App.js
   5. Komponen AddContact akan di-render sebagai halaman baru

3. Form input ditampilkan dengan field:
   - Name
   - Phone
   - Avatar (optional)
4. Saat user mengklik "Save":
   - Data divalidasi secara realtime (event handler onChange)
   - API call untuk menambah kontak baru
   - Data disimpan ke state melalui reducer
   - User diarahkan kembali ke MainPage
   - List kontak diperbarui

# 4. Proses Fitur Edit Contact
1. User mengklik tombol "Edit" pada kontak
   ```javascript
   // ContactCard.js
   const ContactCard = ({ contact, onAvatarUpdate }) => {
     // State management dengan useReducer
     const [state, dispatch] = useReducer(reducer, {
       ...initialState,
       form: {
         name: contact.name,
         phone: contact.phone,
         photo: contact.photo
       }
     });

     // Context untuk fungsi edit
     const { 
       handleEdit, 
       handleDelete, 
       handleResendSuccess, 
       handleRefreshContacts 
     } = useContactContext();

     return (
       <div className="contact-card">
         {/* ... kode lainnya ... */}
         
         {/* Tombol Edit */}
         <button 
           onClick={() => dispatch({ type: 'SET_EDITING', payload: true })}
           className="edit-button"
         >
           <BsPencilSquare />
         </button>
       </div>
     );
   };
   ```

2. Data kontak yang ada di-load ke form
   ```javascript
   // ContactCard.js - Mode edit
   if (state.isEditing) {
     return (
       <div className="contact-card">
         {/* Avatar Section */}
         <div className="avatar">
           <img 
             src={contact.photo || '/user-avatar.svg'} 
             alt={contact.name} 
           />
         </div>

         {/* Edit Form */}
         <div className="contact-info">
           <input
             type="text"
             value={state.form.name}
             onChange={(e) => dispatch({ 
               type: 'SET_FORM', 
               payload: { name: e.target.value } 
             })}
           />
           <input
             type="text"
             value={state.form.phone}
             onChange={(e) => dispatch({ 
               type: 'SET_FORM', 
               payload: { phone: e.target.value } 
             })}
           />
           {/* Save & Cancel buttons */}
           <button onClick={saveChanges}>Save</button>
           <button onClick={() => dispatch({ 
             type: 'SET_EDITING', 
             payload: false 
           })}>Cancel</button>
         </div>
       </div>
     );
   }
   ```

   Penjelasan alur:
   1. Komponen ContactCard menggunakan useReducer untuk state management lokal
   2. Saat tombol edit diklik, dispatch action 'SET_EDITING' ke true
   3. Form edit ditampilkan dengan data kontak yang sudah ada
   4. Setiap perubahan di form akan mengupdate state lokal melalui dispatch 'SET_FORM'
   5. User dapat menyimpan perubahan atau membatalkan edit

3. Saat user mengklik "Save":
   ```javascript
   // ContactCard.js
   const saveChanges = async () => {
     // Validasi data
     if (!state.form.name.trim() || !state.form.phone.trim()) return;

     try {
       const updatedContact = {
         ...state.form,
         id: contact.id,
         photo: contact.photo
       };
       // Memanggil fungsi handleEdit dari context
       await handleEdit(contact.id, updatedContact);
       // Menutup mode edit
       dispatch({ type: 'SET_EDITING', payload: false });
     } catch (error) {
       console.error("Error updating contact:", error);
     }
   };
   ```

   Penjelasan alur save:
   1. Validasi input: memastikan name dan phone tidak kosong
   2. Membuat objek updatedContact dengan data form terbaru
   3. Memanggil handleEdit dari ContactContext untuk update ke API
   4. Jika berhasil, mode edit dinonaktifkan
   5. Jika gagal, error ditampilkan di console

4. handleEdit dipanggil di ContactContext
   ```javascript
   // ContactContext.js
   const handleEdit = async (id, updatedContact) => {
     try {
       // Ambil data contact yang akan diupdate
       const currentContact = state.contacts.find(c => c.id === id);
       
       // Gabungkan data contact dengan mempertahankan photo yang ada
       const contactToUpdate = {
         ...updatedContact,
         photo: currentContact?.photo || updatedContact.photo || null
       };

       // Update contact ke API
       await api.updateContact(id, contactToUpdate);
       
       // Update state contacts dengan data baru
       let newContacts = state.contacts.map((contact) =>
         contact.id === id ? { ...contactToUpdate, id } : contact
       );

       // Cek jika ada pencarian aktif
       if (state.search) {
         // Cek apakah contact yang diupdate masih sesuai dengan keyword pencarian
         const match =
           contactToUpdate.name.toLowerCase().includes(state.search.toLowerCase()) ||
           contactToUpdate.phone.toLowerCase().includes(state.search.toLowerCase());
         
         // Jika tidak match, hapus dari list
         if (!match) {
           newContacts = state.contacts.filter((contact) => contact.id !== id);
         }
       }

       // Update state dengan contacts yang baru
       dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });
     } catch (error) {
       // Handle error
       dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
       console.error('Failed to update contact:', error);
     }
   };
   ```

   Penjelasan alur handleEdit:
   1. Mencari contact yang akan diupdate berdasarkan id
   2. Membuat objek contactToUpdate dengan mempertahankan photo yang ada
   3. Memanggil API untuk update contact
   4. Update state contacts:
      - Map semua contacts, update yang sesuai dengan id
      - Jika ada pencarian aktif, cek apakah masih match
      - Jika tidak match dengan pencarian, hapus dari list
   5. Dispatch action SET_CONTACTS dengan data yang baru
   6. Jika terjadi error:
      - Set error message ke state
      - Tampilkan error di console

# 5. Proses Fitur Upload Avatar
1. User mengklik gambar avatar
   ```javascript
   // MainPage.js
   const MainPage = () => {
     const navigate = useNavigate();
     
     return (
       <div className="app">
         <ContactList
           onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}  // Fungsi untuk navigasi ke halaman upload
         />
       </div>
     );
   };

   // ContactList.js
   const ContactList = ({ onAvatarUpdate }) => {
     return (
       <div className="contact-list">
         {state.contacts.map((contact) => (
           <ContactCard
             key={contact.id}
             contact={contact}  // Passing contact object yang berisi id
             onAvatarUpdate={onAvatarUpdate}  // Passing fungsi dari MainPage
           />
         ))}
       </div>
     );
   };

   // ContactCard.js
   const ContactCard = ({ contact, onAvatarUpdate }) => {
     return (
       <div className="contact-card">
         {/* Avatar Section dengan onClick handler */}
         <div className="avatar" onClick={() => onAvatarUpdate(contact.id)}>  {/* Menggunakan id dari contact */}
           <img 
             src={contact.photo || '/user-avatar.svg'} 
             alt={contact.name} 
           />
         </div>
       </div>
     );
   };
   ```

   Penjelasan alur id:
   1. Di MainPage, fungsi navigate dibuat untuk mengarahkan ke route `/avatar/:id`
   2. Fungsi ini diteruskan ke ContactList sebagai prop onAvatarUpdate
   3. ContactList meneruskan fungsi tersebut ke setiap ContactCard
   4. ContactList juga meneruskan object contact yang berisi id ke setiap ContactCard
   5. Di ContactCard, saat avatar diklik:
      - Mengambil id dari props contact yang diterima
      - Memanggil onAvatarUpdate dengan id tersebut
      - User diarahkan ke halaman upload avatar dengan id yang sesuai

2. File picker dibuka
   ```javascript
   // AvatarUpload.js
   const AvatarUpload = () => {
     const fileInputRef = useRef(null);
     
     // State untuk upload
     const [state, dispatch] = useReducer(reducer, {
       preview: null,
       avatar: null,
       uploading: false,
       error: "",
       isDragging: false
     });

     // Validasi file yang dipilih
     const validateAndPreviewFile = (file) => {
       // Validasi tipe file
       if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
         dispatch({ type: 'SET_ERROR', payload: "Only images (JPEG, PNG, GIF) are allowed" });
         return;
       }

       // Validasi ukuran file
       if (file.size > MAX_FILE_SIZE) {
         dispatch({ type: 'SET_ERROR', payload: "Image size must not exceed 5 MB" });
         return;
       }

       // Buat preview
       const reader = new FileReader();
       reader.onload = () => {
         dispatch({ type: 'SET_PREVIEW', payload: reader.result });
         dispatch({ type: 'SET_ERROR', payload: "" });
       };
       reader.readAsDataURL(file);
     };

     return (
       <div className="avatar-upload">
         <input
           type="file"
           ref={fileInputRef}
           onChange={(e) => validateAndPreviewFile(e.target.files[0])}
           accept="image/*"
           style={{ display: 'none' }}
         />
         {/* ... kode lainnya ... */}
       </div>
     );
   };
   ```

3. User memilih gambar dan diupload
   ```javascript
   // AvatarUpload.js
   const uploadAvatar = async () => {
     if (!state.preview) return;

     try {
       dispatch({ type: 'SET_UPLOADING', payload: true });
       dispatch({ type: 'SET_ERROR', payload: "" });

       // Convert preview ke file
       const response = await fetch(state.preview);
       const blob = await response.blob();
       const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

       // Siapkan dan kirim form data
       const formData = new FormData();
       formData.append("photo", file);

       // Upload ke server
       await api.updateAvatar(id, formData);
       // Refresh data kontak
       handleRefreshContacts();
       // Kembali ke halaman utama
       navigate("/");
     } catch (err) {
       dispatch({ type: 'SET_ERROR', payload: "Failed to upload avatar" });
       console.error("Error uploading avatar:", err);
     } finally {
       dispatch({ type: 'SET_UPLOADING', payload: false });
     }
   };
   ```

   Penjelasan alur:
   1. Di ContactCard, avatar bisa diklik untuk memulai proses upload
   2. Komponen AvatarUpload menangani proses upload:
      - Menyediakan file input untuk memilih gambar
      - Validasi tipe dan ukuran file
      - Membuat preview gambar
      - Mengkonversi gambar ke format yang sesuai
      - Mengirim ke server menggunakan FormData
      - Menangani error dan loading state
   3. Setelah upload berhasil:
      - Data kontak direfresh
      - User diarahkan kembali ke halaman utama
      - Avatar baru ditampilkan di ContactCard

   **Penjelasan Syntax:**
   - `const fileInputRef = useRef(null);`: Membuat referensi ke input file untuk memilih gambar.
   - `const [state, dispatch] = useReducer(reducer, { ... });`: Membuat state untuk upload dengan reducer.
   - `const validateAndPreviewFile = (file) => { ... }`: Fungsi untuk validasi file yang dipilih dan membuat preview.
   - `const uploadAvatar = async () => { ... }`: Fungsi untuk mengupload gambar ke server.

# 6. Proses Fitur Delete Contact
1. User mengklik tombol "Delete"
2. Konfirmasi dialog ditampilkan
3. Jika user konfirmasi:
   - API call untuk delete kontak
   - State diupdate melalui reducer
   - Kontak dihapus dari list
   - Feedback diberikan ke user

   ```javascript
   // ContactCard.js
   const ContactCard = ({ contact }) => {
     // State management dengan useReducer
     const [state, dispatch] = useReducer(reducer, {
       isEditing: false,
       showDelete: false,  // State untuk menampilkan/sembunyikan dialog konfirmasi
       form: { name: '', phone: '', photo: '' }
     });

     return (
       <div className="contact-card">
         {/* ... kode lainnya ... */}
         
         {/* Tombol Delete */}
         <button 
           onClick={() => dispatch({ type: 'SET_SHOW_DELETE', payload: true })}
           aria-label="Delete contact"
           className="action-button delete"
         >
           <BsTrash />
         </button>
       </div>
     );
   };
   ```

   ```javascript
   // ContactCard.js - Dialog konfirmasi delete
   {state.showDelete && (
     <div className="modal-overlay" role="dialog" aria-modal="true">
       <div className="confirm-dialog">
         <p>Are you sure you want to delete this contact?</p>
         <div className="confirm-buttons">
           <button onClick={deleteContact}>Yes</button>
           <button onClick={() => dispatch({ 
             type: 'SET_SHOW_DELETE', 
             payload: false 
           })}>No</button>
         </div>
       </div>
     </div>
   )}

   // Fungsi untuk handle delete
   const deleteContact = async () => {
     try {
       await handleDelete(contact.id);  // Memanggil fungsi delete dari context
       dispatch({ type: 'SET_SHOW_DELETE', payload: false });  // Tutup dialog
     } catch (error) {
       console.error("Error deleting contact:", error);
     }
   };
   ```

   Penjelasan alur:
   1. Saat tombol delete diklik:
      - dispatch action 'SET_SHOW_DELETE' dengan payload true
      - Modal konfirmasi ditampilkan
   2. Di modal konfirmasi:
      - User bisa memilih Yes atau No
      - Yes akan menjalankan fungsi deleteContact
      - No akan menutup modal dengan set showDelete ke false
   3. Proses delete:
      - Memanggil handleDelete dari context dengan id kontak
      - Jika berhasil, modal ditutup
      - Jika gagal, error ditampilkan di console

   **Penjelasan Syntax:**
   - `const [state, dispatch] = useReducer(reducer, { ... });`: Membuat state untuk delete dengan reducer.
   - `const deleteContact = async () => { ... }`: Fungsi untuk menghapus kontak.

   **Penjelasan Syntax Delete di ContactContext:**
   - `const handleDelete = async (id) => { ... }`: Fungsi untuk menghapus kontak dari context.
   - `await api.deleteContact(id);`: API call untuk menghapus kontak.
   - `dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });`: Update state contacts setelah kontak dihapus.

3. Proses delete di context:
   ```javascript
   // ContactContext.js
   const handleDelete = async (id) => {
     try {
       // Cek apakah contact masih pending
       if (id && typeof id === 'string' && id.startsWith('pending_')) {
         // Hapus dari localStorage jika masih pending
         localStorageUtil.removePendingContact(id);
       } else if (id) {
         // Hapus dari server jika sudah tersimpan
         await api.deleteContact(id);
       }

       // Update state dengan menghapus contact dari list
       dispatch({ 
         type: ACTIONS.SET_CONTACTS, 
         payload: state.contacts.filter((contact) => contact.id !== id) 
       });
     } catch (error) {
       // Handle error
       dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
       console.error('Failed to delete contact:', error);
     }
   };

   // api.js - Fungsi untuk delete contact di server
   const deleteContact = async (id) => {
     const response = await fetch(`${API_URL}/phonebooks/${id}`, {
       method: 'DELETE',
     });
     
     if (!response.ok) {
       throw new Error('Failed to delete contact');
     }
     
     return response.json();
   };
   ```

   Penjelasan alur:
   1. Fungsi handleDelete dipanggil dengan id kontak
   2. Cek status kontak:
      - Jika pending (id mulai dengan 'pending_'), hapus dari localStorage
      - Jika sudah tersimpan, hapus dari server dengan API call
   3. Setelah berhasil dihapus:
      - Update state dengan filter untuk menghapus kontak dari list
      - Dispatch action SET_CONTACTS dengan list kontak yang sudah diupdate
   4. Jika terjadi error:
      - Update state error dengan pesan error
      - Tampilkan error di console

   **Penjelasan Syntax Delete di ContactContext:**
   - `const handleDelete = async (id) => { ... }`: Fungsi untuk menghapus kontak dari context.
   - `if (id.startsWith('pending_'))`: Cek apakah kontak masih pending.
   - `localStorageUtil.removePendingContact(id)`: Hapus kontak dari localStorage.
   - `await api.deleteContact(id)`: API call untuk menghapus kontak dari server.
   - `state.contacts.filter((contact) => contact.id !== id)`: Filter untuk menghapus kontak dari list.
   - `dispatch({ type: ACTIONS.SET_CONTACTS, ... })`: Update state contacts setelah kontak dihapus.
   - `dispatch({ type: ACTIONS.SET_ERROR, ... })`: Update state error jika terjadi kesalahan.

# 7. Proses Fitur Search Contact
1. User mengetik di field search
   ```javascript
   // SearchBar.js
   const SearchBar = () => {
     const { state: contextState, handleSearch } = useContactContext();

     return (
       <div className="search-input-container">
         <input
           type="text"
           value={contextState.search}
           onChange={(e) => handleSearch(e.target.value)}
           placeholder="Search contacts..."
         />
       </div>
     );
   };
   ```

2. handleSearch di context dipanggil
   ```javascript
   // ContactContext.js
   const handleSearch = (value) => {
     // Update state search
     dispatch({ type: ACTIONS.UPDATE_SEARCH, payload: value });
     
     // Simpan ke session storage
     if (value) {
       sessionStorage.setItem('contactSearch', value);
       sessionStorage.setItem('searchActive', 'true');
     } else {
       sessionStorage.removeItem('contactSearch');
       sessionStorage.removeItem('searchActive');
     }
   };
   ```

3. Reducer memproses perubahan state
   ```javascript
   // hooks/Reducer.js
   export const ACTIONS = {
     UPDATE_SEARCH: 'update_search',
     // ... actions lainnya
   };

   export function contactReducer(state, action) {
     switch (action.type) {
       case ACTIONS.UPDATE_SEARCH:
         return {
           ...state,
           search: action.payload,
           page: 1  // Reset page saat search berubah
         };
       // ... cases lainnya
     }
   }
   ```

4. useEffect di MainPage mendeteksi perubahan search
   ```javascript
   // MainPage.js
   const MainPage = () => {
     const { state, loadContacts } = useContactContext();

     useEffect(() => {
       loadContacts(false); // false berarti memuat data baru
     }, [state.search]); // Efek dijalankan saat search berubah
   };
   ```

5. API call untuk mendapatkan data baru
   ```javascript
   // ContactContext.js
   const loadContacts = async (loadMore = false) => {
     try {
       const page = loadMore ? state.page + 1 : 1;
       
       // API call dengan parameter search
       const response = await api.getContacts(
         page,
         100,
         state.sortBy,
         state.sortOrder,
         state.search
       );

       if (Array.isArray(response.phonebooks)) {
         dispatch({
           type: ACTIONS.SET_CONTACTS,
           payload: response.phonebooks,
         });
       }
     } catch (error) {
       console.error('Failed to load contacts:', error);
     }
   };
   ```

6. Hasil search ditampilkan di ContactList
   ```javascript
   // ContactList.js
   const ContactList = () => {
     const { state } = useContactContext();

     return (
       <div className="contact-list">
         {state.contacts.map((contact) => (
           <ContactCard
             key={contact.id}
             contact={contact}
           />
         ))}
       </div>
     );
   };
   ```

   Penjelasan alur:
   1. User mengetik di SearchBar -> trigger onChange event
   2. handleSearch dipanggil -> dispatch action UPDATE_SEARCH
   3. Reducer memproses action -> update state.search
   4. useEffect di MainPage mendeteksi perubahan search
   5. loadContacts dipanggil dengan parameter search
   6. Data baru diterima dan ditampilkan di ContactList

   **Penjelasan Syntax:**
   - `onChange={(e) => handleSearch(e.target.value)}`: Event handler search
   - `dispatch({ type: ACTIONS.UPDATE_SEARCH, ... })`: Update state search
   - `case ACTIONS.UPDATE_SEARCH`: Reducer case untuk search
   - `useEffect(() => { ... }, [state.search])`: Effect untuk load data
   - `api.getContacts(..., state.search)`: API call dengan search
   - `state.contacts.map(...)`: Render hasil search

# 8. Proses Fitur Search, Sorting, dan Edit Contact
1. User mengetik di field search
   ```javascript
   // SearchBar.js
   const SearchBar = () => {
     const { state: contextState, handleSearch } = useContactContext();

     return (
       <div className="search-input-container">
         <input
           type="text"
           placeholder="Search contacts..."
           value={contextState.search}
           onChange={(e) => handleSearch(e.target.value)}
           aria-label="Search contacts"
         />
       </div>
     );
   };
   ```

2. User mengklik tombol sort (asc/desc)
   ```javascript
   // SearchBar.js
   const SearchBar = () => {
     const { state: contextState, handleSort } = useContactContext();

     // Toggle sort order saat tombol diklik
     const handleSortClick = () => {
       const newSortOrder = contextState.sortOrder === 'asc' ? 'desc' : 'asc';
       handleSort('name', newSortOrder);
     };

     return (
       <div className="search-bar">
         <button 
           onClick={handleSortClick} 
           className="sort-button"
           aria-label={`Sort ${contextState.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
         >
           {contextState.sortOrder === 'asc' ? 
             <FaSortAlphaDownAlt /> : 
             <FaSortAlphaUpAlt />
           }
         </button>
       </div>
     );
   };
   ```

   **Penjelasan Syntax:**
   1. Search Input:
      - `value={contextState.search}`: Binding ke state search
      - `onChange={(e) => handleSearch(e.target.value)}`: Update state saat input berubah
      - `BsSearch`: Icon search dari react-icons
   
   2. Sort Button:
      - `handleSortClick()`: Toggle antara asc dan desc
      - `handleSort('name', newOrder)`: Update state sort
      - `FaSortAlphaDownAlt/UpAlt`: Icon sort dari react-icons
      
3. Reducer memproses perubahan state:
   ```javascript
   // hooks/Reducer.js
   export const ACTIONS = {
     UPDATE_SORT: 'update_sort',
     // ... actions lainnya
   };

   export function contactReducer(state, action) {
     switch (action.type) {
       case ACTIONS.UPDATE_SORT:
         return {
           ...state,
           sortBy: action.payload.sortBy,
           sortOrder: action.payload.sortOrder,
           page: 1  // Reset page saat sort berubah
         };
       case ACTIONS.UPDATE_SEARCH:
         return {
           ...state,
           search: action.payload,
           page: 1  // Reset page saat search berubah
         };
     }
   }
   ```

4. List diperbarui dengan data yang sudah terfilter dan tersort
   ```javascript
   // ContactContext.js
   const loadContacts = async (loadMore = false) => {
     try {
       const page = loadMore ? state.page + 1 : 1;
       
       // API call dengan parameter search dan sort
       const response = await api.getContacts(
         page,
         100,
         state.sortBy,
         state.sortOrder,
         state.search
       );

       if (Array.isArray(response.phonebooks)) {
         dispatch({
           type: ACTIONS.SET_CONTACTS,
           payload: response.phonebooks
         });
       }
     } catch (error) {
       console.error('Failed to load contacts:', error);
     }
   };
   ```

5. Edit dapat dilakukan pada hasil pencarian
   ```javascript
   // ContactCard.js
   const saveChanges = async () => {
     try {
       const updatedContact = {
         ...state.form,
         id: contact.id
       };
       await handleEdit(contact.id, updatedContact);
       dispatch({ type: 'SET_EDITING', payload: false });
     } catch (error) {
       console.error("Error updating contact:", error);
     }
   };
   ```

   **Penjelasan Syntax:**
   - `case ACTIONS.UPDATE_SORT`: Update state sort dan reset page
   - `case ACTIONS.UPDATE_SEARCH`: Update state search dan reset page
   - `loadContacts`: Load data dengan parameter search & sort
   - `saveChanges`: Simpan perubahan edit ke server

   **Alur Proses:**
   1. Search:
      - User mengetik di search field
      - handleSearch dipanggil dengan value input
      - Reducer memproses UPDATE_SEARCH
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan search
      - API call dengan parameter search baru
      - List kontak diupdate dengan hasil search

   2. Sort:
      - User klik tombol sort
      - handleSortClick toggle asc/desc
      - handleSort dipanggil dengan field dan order baru
      - Reducer memproses UPDATE_SORT
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan sort
      - API call dengan parameter sort baru
      - List kontak diupdate dengan urutan baru

   3. Edit:
      - User klik tombol edit di ContactCard
      - Form edit ditampilkan dengan data kontak
      - User edit data dan klik save
      - saveChanges dipanggil
      - API call untuk update kontak
      - State editing diset false
      - List kontak direfresh dengan data terbaru

# 9. Proses Fitur Searching dan Navigation
1. User melakukan pencarian dan hasil ditampilkan
   ```javascript
   // MainPage.js
   const MainPage = () => {
     const { state } = useContactContext();
     const [showAddForm, setShowAddForm] = useState(false);

     // Simpan state search ke session storage
     useEffect(() => {
       if (state.search) {
         sessionStorage.setItem('contactSearch', state.search);
       }
     }, [state.search]);

     return (
       <div className="main-page">
         <SearchBar />
         <ContactList />
         <button onClick={() => setShowAddForm(true)}>Add Contact</button>
       </div>
     );
   };
   ```

2. Navigasi ke Add Contact Form
   ```javascript
   // AddContactForm.js
   const AddContactForm = () => {
     const navigate = useNavigate();
     const { state } = useContactContext();
     
     // Simpan state search saat ini
     const currentSearch = state.search;

     const handleCancel = () => {
       // Kembali ke halaman utama
       navigate('/');
     };

     return (
       <div className="add-form">
         <form>
           {/* Form fields */}
         </form>
         <button onClick={handleCancel}>Cancel</button>
       </div>
     );
   };
   ```

3. Pulihkan state search saat kembali
   ```javascript
   // ContactContext.js
   const ContactProvider = ({ children }) => {
     const [state, dispatch] = useReducer(reducer, {
       search: sessionStorage.getItem('contactSearch') || '',
       contacts: []
     });

     // Pulihkan search saat component mount
     useEffect(() => {
       const savedSearch = sessionStorage.getItem('contactSearch');
       if (savedSearch) {
         dispatch({ 
           type: ACTIONS.UPDATE_SEARCH, 
           payload: savedSearch 
         });
       }
     }, []);

     // Load contacts dengan search yang dipulihkan
     useEffect(() => {
       const loadContacts = async () => {
         try {
           const response = await api.getContacts(
             state.page,
             100,
             state.sortBy,
             state.sortOrder,
             state.search
           );

           dispatch({
             type: ACTIONS.SET_CONTACTS,
             payload: response.phonebooks
           });
         } catch (error) {
           console.error('Failed to load contacts:', error);
         }
       };

       loadContacts();
     }, [state.search]);
   };
   ```

   **Penjelasan Syntax:**
   - `sessionStorage.setItem`: Simpan state search
   - `sessionStorage.getItem`: Pulihkan state search
   - `navigate('/')`: Kembali ke halaman utama
   - `useEffect`: Load contacts dengan search yang dipulihkan

# 10. Proses Fitur searching dan sorting mulai dari user mengetik keyword di search field dan mengklik tombol sort
1. User melakukan input search atau klik sort
   ```javascript
   // SearchBar.js
   const SearchBar = () => {
     const { state, handleSearch, handleSort } = useContactContext();

     return (
       <div className="search-bar">
         {/* Search Input */}
         <input
           type="text"
           value={state.search}
           onChange={(e) => handleSearch(e.target.value)}
           placeholder="Search contacts..."
         />

         {/* Sort Button */}
         <button onClick={() => {
           const newOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
           handleSort('name', newOrder);
         }}>
           {state.sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
         </button>
       </div>
     );
   };
   ```

2. Context memproses perubahan state
   ```javascript
   // ContactContext.js
   const ContactProvider = ({ children }) => {
     const [state, dispatch] = useReducer(reducer, {
       search: '',
       sortBy: 'name',
       sortOrder: 'asc',
       page: 1,
       contacts: []
     });

     const handleSearch = (value) => {
       dispatch({ type: ACTIONS.UPDATE_SEARCH, payload: value });
     };

     const handleSort = (field, order) => {
       dispatch({ 
         type: ACTIONS.UPDATE_SORT, 
         payload: { sortBy: field, sortOrder: order }
       });
     };
   };
   ```

3. useEffect mendeteksi perubahan dan memanggil API
   ```javascript
   // MainPage.js
   useEffect(() => {
     const loadContacts = async () => {
       try {
         const response = await api.getContacts(
           state.page,
           100,
           state.sortBy,
           state.sortOrder,
           state.search
         );

         dispatch({
           type: ACTIONS.SET_CONTACTS,
           payload: response.phonebooks
         });
       } catch (error) {
         console.error('Failed to load contacts:', error);
       }
     };

     loadContacts();
   }, [state.search, state.sortBy, state.sortOrder, state.page]);
   ```

4. List kontak diperbarui
   ```javascript
   // ContactList.js
   const ContactList = () => {
     const { state } = useContactContext();

     return (
       <div className="contact-list">
         {state.contacts.map((contact) => (
           <ContactCard 
             key={contact.id} 
             contact={contact}
           />
         ))}
         {state.contacts.length === 0 && (
           <div className="no-results">No contacts found</div>
         )}
       </div>
     );
   };
   ```

   **Penjelasan Syntax:**
   - `handleSearch`: Update state pencarian langsung
   - `handleSort`: Update state pengurutan
   - `useEffect`: Trigger API call saat state berubah
   - `ContactList`: Render hasil pencarian/pengurutan

   **Alur Proses:**
   1. Search:
      - User mengetik di search field
      - handleSearch dipanggil dengan value input
      - Reducer memproses UPDATE_SEARCH
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan search
      - API call dengan parameter search baru
      - List kontak diupdate dengan hasil search

   2. Sort:
      - User klik tombol sort
      - handleSortClick toggle asc/desc
      - handleSort dipanggil dengan field dan order baru
      - Reducer memproses UPDATE_SORT
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan sort
      - API call dengan parameter sort baru
      - List kontak diupdate dengan urutan baru

   3. Edit:
      - User klik tombol edit di ContactCard
      - Form edit ditampilkan dengan data kontak
      - User edit data dan klik save
      - saveChanges dipanggil
      - API call untuk update kontak
      - State editing diset false
      - List kontak direfresh dengan data terbaru

# 11. Proses Fitur Searching dan Navigation
1. User melakukan pencarian dan hasil ditampilkan
   ```javascript
   // MainPage.js
   const MainPage = () => {
     const { state } = useContactContext();
     const [showAddForm, setShowAddForm] = useState(false);

     // Simpan state search ke session storage
     useEffect(() => {
       if (state.search) {
         sessionStorage.setItem('contactSearch', state.search);
       }
     }, [state.search]);

     return (
       <div className="main-page">
         <SearchBar />
         <ContactList />
         <button onClick={() => setShowAddForm(true)}>Add Contact</button>
       </div>
     );
   };
   ```

2. Navigasi ke Add Contact Form
   ```javascript
   // AddContactForm.js
   const AddContactForm = () => {
     const navigate = useNavigate();
     const { state } = useContactContext();
     
     // Simpan state search saat ini
     const currentSearch = state.search;

     const handleCancel = () => {
       // Kembali ke halaman utama
       navigate('/');
     };

     return (
       <div className="add-form">
         <form>
           {/* Form fields */}
         </form>
         <button onClick={handleCancel}>Cancel</button>
       </div>
     );
   };
   ```

3. Pulihkan state search saat kembali
   ```javascript
   // ContactContext.js
   const ContactProvider = ({ children }) => {
     const [state, dispatch] = useReducer(reducer, {
       search: sessionStorage.getItem('contactSearch') || '',
       contacts: []
     });

     // Pulihkan search saat component mount
     useEffect(() => {
       const savedSearch = sessionStorage.getItem('contactSearch');
       if (savedSearch) {
         dispatch({ 
           type: ACTIONS.UPDATE_SEARCH, 
           payload: savedSearch 
         });
       }
     }, []);

     // Load contacts dengan search yang dipulihkan
     useEffect(() => {
       const loadContacts = async () => {
         try {
           const response = await api.getContacts(
             state.page,
             100,
             state.sortBy,
             state.sortOrder,
             state.search
           );

           dispatch({
             type: ACTIONS.SET_CONTACTS,
             payload: response.phonebooks
           });
         } catch (error) {
           console.error('Failed to load contacts:', error);
         }
       };

       loadContacts();
     }, [state.search]);
   };
   ```

   **Penjelasan Syntax:**
   - `sessionStorage.setItem`: Simpan state search
   - `sessionStorage.getItem`: Pulihkan state search
   - `navigate('/')`: Kembali ke halaman utama
   - `useEffect`: Load contacts dengan search yang dipulihkan

   **Alur Proses:**
   1. Search:
      - User mengetik di search field
      - handleSearch dipanggil dengan value input
      - Reducer memproses UPDATE_SEARCH
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan search
      - API call dengan parameter search baru
      - List kontak diupdate dengan hasil search

   2. Navigasi:
      - User klik tombol add
      - Navigasi ke AddContactForm
      - Simpan state search saat ini
      - Kembali ke halaman utama
      - Pulihkan state search saat kembali

   3. Pulihkan state search saat kembali
      - useEffect dipanggil saat component mount
      - Reducer memproses UPDATE_SEARCH
      - Page direset ke 1
      - useEffect di MainPage terdeteksi perubahan search
      - API call dengan parameter search baru
      - List kontak diupdate dengan hasil search

# 12. Proses Fitur Resend Saat Server Offline dan Online

## Deskripsi
Fitur Resend memungkinkan aplikasi untuk tetap berfungsi saat server offline dengan menyimpan data sementara di local storage. Ketika server kembali online, data dapat dikirim ulang ke server.

## Alur Proses
1. **Kondisi Awal (Server Online)**
   - User berada di halaman utama (MainPage)
   - Daftar kontak ditampilkan dari database
   - Server dalam keadaan aktif

2. **Server Dimatikan**
   - Server dimatikan saat user masih di aplikasi
   - Aplikasi tetap berjalan di sisi client

3. **Proses Add Contact Saat Offline**
   ```javascript
   // AddContact.js
   const saveContact = async (e) => {
     try {
       // Coba simpan ke server
       await api.addContact(form);
     } catch (err) {
       // Jika server offline, simpan ke local storage
       const newContact = localStorageUtil.addPendingContact({
         name: form.name,
         phone: form.phone
       });
       
       // Update tampilan dengan kontak pending
       handleRefreshContacts();
     }
   };
   ```

4. **Penyimpanan di Local Storage**
   ```javascript
   // localStorage.js
   const addPendingContact = (contact) => {
     const pendingContacts = getPendingContacts();
     const newContact = {
       ...contact,
       id: generateTempId(),
       status: 'pending'
     };
     
     pendingContacts.push(newContact);
     localStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
     return newContact;
   };
   ```

5. **Tampilan Kontak Pending**
   ```javascript
   // ContactCard.js
   return (
     <div className="contact-card">
       {contact.status === 'pending' ? (
         <button onClick={handleResend} className="resend-button">
           <BsArrowRepeat /> Resend
         </button>
       ) : (
         <button onClick={handleEdit} className="edit-button">
           <BsPencilSquare /> Edit
         </button>
       )}
     </div>
   );
   ```

6. **Proses Resend Saat Server Masih Offline**
   ```javascript
   // ContactCard.js
   const handleResend = async () => {
     try {
       // Cek status server
       const isAvailable = await localStorageUtil.isServerAvailable();
       if (!isAvailable) {
         alert("Server is not available. Please try again later.");
         return;
       }
     } catch (error) {
       console.error("Error checking server:", error);
     }
   };
   ```

7. **Proses Resend Saat Server Kembali Online**
   ```javascript
   // ContactCard.js
   const handleResend = async () => {
     try {
       // Cek status server
       const isAvailable = await localStorageUtil.isServerAvailable();
       if (!isAvailable) {
         alert("Server is not available. Please try again later.");
         return;
       }

       // Kirim data ke server
       const savedContact = await api.addContact({
         name: contact.name,
         phone: contact.phone
       });

       // Hapus dari pending contacts
       localStorageUtil.removePendingContact(contact.id);

       // Update UI
       if (handleResendSuccess) {
         await handleResendSuccess(contact.id, savedContact);
       }
       handleRefreshContacts();
     } catch (error) {
       console.error("Error resending contact:", error);
       alert("Failed to resend contact. Please try again.");
     }
   };
   ```

## Penjelasan Detail Setiap Tahap

1. **Deteksi Status Server**
   - Menggunakan fungsi `isServerAvailable()` untuk cek koneksi server
   - Mengembalikan `true` jika server merespon, `false` jika timeout/error
   - Timeout diset 5 detik untuk menghindari blocking terlalu lama

2. **Penyimpanan Lokal**
   - Data disimpan dengan status 'pending'
   - Menggunakan ID sementara dengan prefix 'temp_'
   - Menyimpan semua data kontak termasuk foto jika ada

3. **Manajemen State UI**
   - Kontak pending ditandai dengan badge "Pending"
   - Button Edit diganti dengan button Resend
   - Alert ditampilkan saat server tidak tersedia

4. **Proses Sinkronisasi**
   - Data dikirim ke server saat online
   - ID sementara diganti dengan ID dari server
   - Status 'pending' dihapus setelah berhasil

5. **Error Handling**
   - Validasi input tetap berjalan saat offline
   - Retry mechanism untuk pengiriman ulang
   - Feedback ke user untuk setiap status operasi

## Komponen yang Terlibat

1. **AddContact**
   - Handle input form
   - Deteksi status server
   - Simpan ke local storage jika offline

2. **ContactCard**
   - Tampilkan status kontak
   - Handle proses resend
   - Tampilkan feedback ke user

3. **LocalStorage Service**
   - Manajemen data pending
   - Generate ID sementara
   - Cek status server

4. **API Service**
   - Komunikasi dengan server
   - Handle timeout dan error
   - Sinkronisasi data



### Penjelasan useReducer dan useContext

**useReducer:**
- Digunakan untuk state management yang kompleks
- Memisahkan logic state dari component
- Membuat state lebih predictable
- Contoh penggunaan di aplikasi:
```javascript
const [state, dispatch] = useReducer(contactReducer, initialState);
```

**useContext:**
- Menyediakan state global
- Menghindari prop drilling
- Memudahkan sharing state antar component
- Contoh penggunaan:
```javascript
const { contacts, dispatch } = useContactContext();
```

### Pertanyaan yang Mungkin Ditanyakan:

1. Bagaimana cara menangani error saat API call?
2. Bagaimana implementasi offline support?
3. Bagaimana cara mengoptimasi performance untuk data yang banyak?
4. Bagaimana cara menangani concurrent updates?
5. Bagaimana cara menghandle file upload yang besar?
6. Bagaimana security measures yang diterapkan?
7. Bagaimana cara menghandle file upload yang besar?
8. Bagaimana security measures yang diterapkan?
9. Bagaimana cara testing komponen-komponen tersebut?

### Jawaban Pertanyaan yang Mungkin Ditanyakan:

1. **Cara Menangani Error saat API Call:**
   - Menggunakan try-catch block untuk menangkap error
   - Implementasi error boundary di React
   - Menampilkan pesan error yang user-friendly
   - Menyimpan error state di reducer
   - Retry mechanism untuk API calls yang gagal
   ```javascript
   try {
     await api.updateContact(contactData);
   } catch (error) {
     dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
     // Show error notification
   }
   ```

2. **Implementasi Offline Support:**
   - Menggunakan localStorage untuk menyimpan data
   - Implementasi queue untuk pending changes
   - Sync mechanism saat online kembali
   - Optimistic UI updates
   ```javascript
   // Simpan ke localStorage saat offline
   if (!navigator.onLine) {
     localStorageUtil.savePendingContact(contactData);
   }
   ```

3. **Optimasi Performance untuk Data Banyak:**
   - Implementasi virtual scrolling/windowing
   - Pagination di server side
   - Lazy loading untuk gambar
   - Memoization dengan useMemo dan useCallback
   - Code splitting untuk komponen besar
   ```javascript
   // Contoh implementasi pagination
   const loadMore = () => {
     if (hasMore && !loading) {
       dispatch({ type: ACTIONS.SET_PAGE, payload: page + 1 });
     }
   };
   ```

5. **Strategi Caching:**
   - Browser caching untuk static assets
   - In-memory caching di client
   - Cache invalidation strategy
   - Service Worker untuk offline caching
   ```javascript
   // Implementasi cache
   const cache = new Map();
   const getCachedData = (key) => {
     if (cache.has(key)) return cache.get(key);
     // Fetch and cache if not exists
   };
   ```

6. **Handle File Upload yang Besar:**
   - Chunked upload
   - Progress indicator
   - File size validation
   - Kompresi gambar client-side
   ```javascript
   // Contoh chunked upload
   const uploadChunk = async (file, chunkSize) => {
     const totalChunks = Math.ceil(file.size / chunkSize);
     for (let i = 0; i < totalChunks; i++) {
       const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
       await uploadChunkToServer(chunk, i);
     }
   };
   ```

7. **Security Measures:**
   - Input validation
   - XSS prevention
   - CSRF protection
   - Rate limiting
   - Secure file upload validation
   ```javascript
   // Contoh input validation
   const validateContact = (data) => {
     if (!data.name || data.name.length < 2) {
       throw new Error('Nama harus minimal 2 karakter');
     }
     // More validations...
   };
   ```

