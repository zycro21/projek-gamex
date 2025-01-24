import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../userStyle/footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; 2025 GameZone. All rights reserved. Mochamad Dimas Putra Hermawan.</p>
                <ul className="footer-links">
                    <li>
                        <Link to="/privacy">Privacy Policy</Link>
                    </li>
                    <li>
                        <Link to="/terms">Terms of Service</Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;