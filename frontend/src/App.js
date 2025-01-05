// Mengimpor modul dan komponen yang diperlukan
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import MainPage from "./components/MainPage";
import { api } from "./services/api";
import "./styles/styles.css";
import { ContactProvider, useContacts } from "./hooks/useContacts";

// Wrapper component for routes that need contact context
const AppRoutes = () => {
  const { loadContacts } = useContacts();

  const handleAdd = async (contact) => {
    try {
      await api.addContact(contact);
      // Refresh contacts after adding new contact
      loadContacts(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  };

  const handleAvatarUpdate = async () => {
    // Refresh contacts after avatar update
    await loadContacts(false);
  };

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/add" element={<AddContact onAdd={handleAdd} />} />
      <Route
        path="/avatar/:id"
        element={<AvatarUpload onAvatarUpdate={handleAvatarUpdate} />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ContactProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ContactProvider>
  );
};

export default App;
