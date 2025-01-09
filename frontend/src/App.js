import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import MainPage from "./components/MainPage";
import "./styles/styles.css";

export default function App() {
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
