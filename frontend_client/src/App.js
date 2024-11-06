import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Ganti Switch dengan Routes
import Register from "./components/Register";
import Login from "./components/Login";
import UsersDashboard from "./components/UserDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} /> {/* Gunakan element sebagai prop */}
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<UsersDashboard />} />
        <Route path="/" element={<Login />} /> {/* Default ke login */}
      </Routes>
    </Router>
  );
};

export default App;