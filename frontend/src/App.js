import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api } from "./services/api";
import MainPage from "./components/MainPage";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import './App.css';
import "./styles/styles.css";

export default function App() {
  async function addNewContact(contact) {
    try {
      return await api.addContact(contact);
    } catch (err) {
      console.error('Failed to add contact:', err);
      throw err;
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddContact onAdd={addNewContact} />} />
        <Route path="/avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </BrowserRouter>
  );
}
