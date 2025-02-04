import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UsersDashboard from "./pages/UserDashboard";
import GamesDashboard from "./pages/games";
import ReviewDashboard from "./pages/Review";
import WishlistDashboard from "./pages/Wishlist";
import OrderDashboard from "./pages/order";
import MainDashboard from "./pages/MainDashboard";
import MainPages from "./userPages/mainpages";
import UserArticles from "./userPages/UserArticles";
import UserContact from "./userPages/UserContact";
import UserProfile from "./userPages/UserProfile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/userdashboard" element={<MainPages />} />
        <Route path="/userarticles" element={<UserArticles />} />
        <Route path="/usercontact" element={<UserContact />}/>
        <Route path="/userprofile" element={<UserProfile />}/>
        <Route path="/register" element={<Register />} />
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