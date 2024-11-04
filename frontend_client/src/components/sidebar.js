import React from "react";
import { Link } from "react-router-dom"; // Import Link untuk navigasi
import "../styles/sidebar.css"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        {/* Ganti URL gambar dengan yang sesuai */}
        <img src="/path/to/logo.png" alt="Logo" className="logo" />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/users">Users</Link>
          </li>
          <li>
            <Link to="/users">Games</Link>
          </li>
          <li>
            <Link to="/users">Transaction</Link>
          </li>
          <li>
            <Link to="/users">Review</Link>
          </li>
          <li>
            <Link to="/users">Article</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/login">Logout</Link> {/* Ubah link logout ke halaman login */}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;