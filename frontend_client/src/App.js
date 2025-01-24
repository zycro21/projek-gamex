import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Ganti Switch dengan Routes
import Register from "./pages/Register";
import Login from "./pages/Login";
import UsersDashboard from "./pages/UserDashboard";
import GamesDashboard from "./pages/games";
import ReviewDashboard from "./pages/Review";
import WishlistDashboard from "./pages/Wishlist";
import OrderDashboard from "./pages/order";
import MainDashboard from "./pages/MainDashboard";
import MainPages from "./userPages/mainpages";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/userdashboard" element={<MainPages />} />
        <Route path="/register" element={<Register />} /> {/* Gunakan element sebagai prop */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/users" element={<UsersDashboard />} />
        <Route path="/games" element={<GamesDashboard />} />
        <Route path="/reviews" element={<ReviewDashboard />} />
        <Route path="/wishlist" element={<WishlistDashboard />} />
        <Route path="/transaction" element={<OrderDashboard />} />
        <Route path="/" element={<MainPages />} /> {/* Default ke login */}
      </Routes>
    </Router>
  );
};

export default App;