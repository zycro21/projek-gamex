import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img
          src="/gamex-logo-png-transparent.png"
          alt="Logo GAME-X"
          className="logo"
        />
      </div>
      <nav>
        <ul>
          <li>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              <img
                src="/logo-rumah.png"
                alt="Logo Dashboard"
                className="menu-icon"
              ></img>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className={location.pathname === "/users" ? "active" : ""}
            >
              <img
                src="/logo-orang.png"
                alt="Logo Users"
                className="menu-icon"
              ></img>
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/games"
              className={location.pathname === "/games" ? "active" : ""}
            >
              <img
                src="/logo-games2.png"
                alt="Logo Games"
                className="menu-icon"
              ></img>
              Games
            </Link>
          </li>
          <li>
            <Link
              to="/transactions"
              className={location.pathname === "/transactions" ? "active" : ""}
            >
              <img
                src="/logo-transaksi.png"
                alt="Logo Transaksi"
                className="menu-icon"
              ></img>
              Transaction
            </Link>
          </li>
          <li>
            <Link
              to="/reviews"
              className={location.pathName === "/reviews" ? "active" : ""}
            >
              <img
                src="/logo-review.png"
                alt="Logo Review"
                className="menu-icon"
              ></img>
              Review
            </Link>
          </li>
          <li>
            <Link
              to="/articles"
              className={location.pathname === "/articles" ? "active" : ""}
            >
              <img
                src="/logo-artikel.jpg"
                alt="Logo Artikel"
                className="menu-icon"
              ></img>
              Article
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={location.pathname === "/settings" ? "active" : ""}
            >
              <img
                src="/logo-setting.png"
                alt="Logo Setting"
                className="menu-icon"
              ></img>
              Settings
            </Link>
          </li>
          <li className="logoutcontainer">
            <div className="logout-wrapper">
              <Link to="/login">
                <img
                  src="/logo-logout.png"
                  alt="Logo LogOut"
                  className="menu-icon"
                ></img>
                Logout
              </Link>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;