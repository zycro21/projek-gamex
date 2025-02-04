import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../userStyle/userArticles.css";
import Navbar from "../userComponents/navbar";
import Footer from "../userComponents/footer";

const UserArticles = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        toast.info(`Searching for "${searchQuery}"...`);
        setSearchQuery("");
    };

    return (
        <div className="article-page">
            <ToastContainer />
            <Navbar />

            <div className="article-hero-section">
                <h1>Welcome to GameZone Articles</h1>
                <p>
                    Discover the latest insights, reviews, and guides about your favorite games.
                    Stay up-to-date with everything happening in the world of gaming.
                </p>
            </div>

            <div className="article-search-section">
                <form onSubmit={handleSearch} className="article-search-form">
                    <input
                        type="text"
                        placeholder="Search for articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div className="article-container">
                <div className="article-grid">
                    <div className="main-article">
                        <h2>Feature Article: The Rise of Open World Games</h2>
                        <img
                            src="https://source.unsplash.com/800x400/?game,open-world"
                            alt="Open world game"
                            className="article-image"
                        />
                        <p>
                            Open-world games have transformed the gaming landscape, offering players the freedom to explore,
                            interact, and create their own stories. From classics like The Legend of Zelda: Breath of the
                            Wild to modern masterpieces like Elden Ring, discover why open-world games continue to captivate
                            audiences worldwide.
                        </p>
                        <a href="/read-more" className="article-read-more">
                            Read More →
                        </a>
                    </div>
                    <div className="main-article">
                        <h2>Feature Article: The Rise of Open World Games</h2>
                        <img
                            src="https://source.unsplash.com/800x400/?game,open-world"
                            alt="Open world game"
                            className="article-image"
                        />
                        <p>
                            Open-world games have transformed the gaming landscape, offering players the freedom to explore,
                            interact, and create their own stories. From classics like The Legend of Zelda: Breath of the
                            Wild to modern masterpieces like Elden Ring, discover why open-world games continue to captivate
                            audiences worldwide.
                        </p>
                        <a href="/read-more" className="article-read-more">
                            Read More →
                        </a>
                    </div>
                    <div className="main-article">
                        <h2>Feature Article: The Rise of Open World Games</h2>
                        <img
                            src="https://source.unsplash.com/800x400/?game,open-world"
                            alt="Open world game"
                            className="article-image"
                        />
                        <p>
                            Open-world games have transformed the gaming landscape, offering players the freedom to explore,
                            interact, and create their own stories. From classics like The Legend of Zelda: Breath of the
                            Wild to modern masterpieces like Elden Ring, discover why open-world games continue to captivate
                            audiences worldwide.
                        </p>
                        <a href="/read-more" className="article-read-more">
                            Read More →
                        </a>
                    </div>
                    <div className="main-article">
                        <h2>Feature Article: The Rise of Open World Games</h2>
                        <img
                            src="https://source.unsplash.com/800x400/?game,open-world"
                            alt="Open world game"
                            className="article-image"
                        />
                        <p>
                            Open-world games have transformed the gaming landscape, offering players the freedom to explore,
                            interact, and create their own stories. From classics like The Legend of Zelda: Breath of the
                            Wild to modern masterpieces like Elden Ring, discover why open-world games continue to captivate
                            audiences worldwide.
                        </p>
                        <a href="/read-more" className="article-read-more">
                            Read More →
                        </a>
                    </div>
                </div>
                <aside className="article-sidebar">
                    <h3>Latest Articles</h3>
                    <ul className="article-list">
                        <li><a href="#">Top 10 RPGs You Must Play in 2023</a></li>
                        <li><a href="#">The Evolution of Battle Royale Games</a></li>
                        <li><a href="#">How Graphics Have Revolutionized Gaming</a></li>
                        <li><a href="#">Mobile Gaming Trends to Watch</a></li>
                    </ul>

                    <h3>Recommended Games</h3>
                    <ul className="article-game-list">
                        <li><a href="#">Elden Ring</a></li>
                        <li><a href="#">Horizon Forbidden West</a></li>
                        <li><a href="#">Cyberpunk 2077</a></li>
                        <li><a href="#">The Witcher 3: Wild Hunt</a></li>
                    </ul>
                </aside>
            </div>

            <Footer />
        </div>
    );
};

export default UserArticles;