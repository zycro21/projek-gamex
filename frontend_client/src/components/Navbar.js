import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ pageTitle }) => {
  const navigate = useNavigate();

  // Mengambil data pengguna dari localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.username || "Guest"; // Menyediakan default jika tidak ada data
  const profilePic = user.profilePic || "path/to/default-pic.jpg"; // Menyediakan default jika tidak ada gambar

  const handleProfileClick = () => {
    navigate("/profile"); // Navigasi ke halaman profil
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      <div className="navbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
        />
      </div>
      <div className="navbar-right">
        <div className="notifications">
          <i className="bell-icon">🔔</i>
        </div>
        <div className="user-info" onClick={handleProfileClick}>
          <img
            src={profilePic}
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{userName}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
