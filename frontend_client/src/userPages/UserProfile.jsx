import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../userStyle/userProfile.css";
import Navbar from "../userComponents/navbar";
import Footer from "../userComponents/footer";

const UserProfile = () => {
    return (
        <div className="page-profile">
            <Navbar />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-picture">
                        <img src="https://via.placeholder.com/150"
                            alt="User"
                            className="animated-picture" />
                    </div>
                    <div className="profile-info">
                        <h1 className="animated-title">John Doe</h1>
                        <p className="animated-subtitle">Game Enthusiast | Developer | Explorer</p>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-card">
                        <h2>About Me</h2>
                        <p>Passionate gamer and web developer with a love for open-world games,
                            technology, and exploring new horizons. Let's create something amazing
                            together!</p>
                    </div>

                    <div className="profile-card">
                        <h2>Skills</h2>
                        <ul className="skills-list">
                            <li>Web Development</li>
                            <li>Game Design</li>
                            <li>Graphic Design</li>
                            <li>3D Modeling</li>
                        </ul>
                    </div>

                    <div className="profile-card">
                        <h2>Recent Activity</h2>
                        <ul className="activity-list">
                            <li>Posted: "Top 10 RPG Games of 2023"</li>
                            <li>Commented on: "Elden Ring Gameplay Analysis"</li>
                            <li>Started following: Horizon Forbidden West</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default UserProfile;