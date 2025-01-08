import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import "./App.css";
import "./styles/styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddContact />} />
        <Route path="/avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </BrowserRouter>
  );
}