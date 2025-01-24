import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../userStyle/navbar.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faBook, faNewspaper, faMoneyBill, faPerson, faPhone, faDoorOpen } from '@fortawesome/free-solid-svg-icons'; // import ikon yang diinginkan

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="logo">
                    <Link to="/">GameZone</Link>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/usergames">
                            <FontAwesomeIcon icon={faGamepad} /> Games
                        </Link>
                    </li>
                    <li>
                        <Link to="/userwishlist">
                            <FontAwesomeIcon icon={faBook} /> Wishlist
                        </Link>
                    </li>
                    <li>
                        <Link to="/userarticles">
                            <FontAwesomeIcon icon={faNewspaper} /> Articles
                        </Link>
                    </li>
                    <li>
                        <Link to="/userorders">
                            <FontAwesomeIcon icon={faMoneyBill} /> Orders
                        </Link>
                    </li>
                    <li>
                        <Link to="/userprofile">
                            <FontAwesomeIcon icon={faPerson} /> Profile
                        </Link>
                    </li>
                    <li>
                        <Link to="/usercontact">
                            <FontAwesomeIcon icon={faPhone} /> Contact
                        </Link>
                    </li>
                    <li>
                        <Link to="/userlogin">
                            <FontAwesomeIcon icon={faDoorOpen} /> Login
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;