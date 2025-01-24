import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../userStyle/mainpages.css";
import Navbar from "../userComponents/navbar";
import Footer from "../userComponents/footer";
import game1 from "../assets/game-1.jpg";
import game2 from "../assets/game-2.jpg";
import game3 from "../assets/game-3.jpg";
import game4 from "../assets/game-4.jpg";
import game5 from "../assets/game-5.png";
import featuredGame1 from "../assets/darksouls3.jpg";
import featuredGame2 from "../assets/horizonzero.jpg";
import featuredGame3 from "../assets/residentevil.jpg";
import recommendedGame1 from "../assets/diablo-r-1.png";
import recommendedGame2 from "../assets/sf-r-2.jpg";
import recommendedGame3 from "../assets/viewfinder-r-3.png"

const MainPages = () => {
    const images = [game1, game2, game3, game4, game5];
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    // Fungsi Untuk Slider Otomatis
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    // Fungsi Pindah Ke Slider(gambar berikutnya)
    const handleSlideNext = () => {
        setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % images.length);
    }

    const handleSlidePrevious = () => {
        setCurrentSliderIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }

    const sliderRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const [selectedGenre, setSelectedGenre] = useState("RPG");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const genres = {
        RPG: [
            { name: "Dark Souls III", rating: 9.5 },
            { name: "The Witcher 3", rating: 9.3 },
            { name: "Skyrim", rating: 9.1 },
        ],
        Shooter: [
            { name: "Call of Duty: Modern Warfare", rating: 8.9 },
            { name: "Apex Legends", rating: 8.7 },
            { name: "Overwatch", rating: 8.5 },
        ],
        Strategy: [
            { name: "Civilization VI", rating: 9.0 },
            { name: "Age of Empires IV", rating: 8.8 },
            { name: "Stellaris", rating: 8.6 },
        ],
    };

    // Data untuk Popularity Chart (Top 5 Games)
    const top5PopularGames = [
        { name: "Minecraft", popularity: 9.7 },
        { name: "Fortnite", popularity: 9.5 },
        { name: "League of Legends", popularity: 9.3 },
        { name: "Valorant", popularity: 9.1 },
        { name: "PUBG", popularity: 8.9 },
    ];

    const handleGenreChange = (genre) => {
        setSelectedGenre(genre);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    return (
        <div className="mainpage-user">
            <ToastContainer />
            <Navbar />

            <div className="viral-slider">
                <div className="slider-container">
                    <div className="slider">
                        <img src={images[currentSliderIndex]} alt={`Game ${currentSliderIndex + 1}`} className="slider-image" />
                    </div>
                    <button className="slider-btn left-btn" onClick={handleSlidePrevious}>
                        <span className="arrow">&larr;</span>
                        <span className="btn-text">Previous</span>
                    </button>
                    <button className="slider-btn right-btn" onClick={handleSlideNext}>
                        <span className="arrow">&rarr;</span>
                        <span className="btn-text">Next</span>
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="container-hero-section">
                    <div className="hero-section">
                        <h1 className="hero-title">Welcome to <span>GameZone</span></h1>
                        <p className="hero-description">
                            Your one-stop destination for discovering the latest and greatest in games,
                            engaging articles, exclusive content, and so much more to fuel your passion for gaming!
                        </p>
                        <button className="cta-button">Explore Now</button>
                    </div>
                </div>
                <div className="featured-section">
                    <div className="container-featured-section">
                        <h2 className="section-title">Interesting Games</h2>
                        <div className="featured-games">
                            <div className="featured-game-card">
                                <span className="badge top-rated">Top Rated</span>
                                <img src={featuredGame1} alt="Dark Souls III" />
                                <h3 className="game-title">Dark Souls III</h3>
                                <p className="game-description">
                                    An immersive RPG adventure that will take you to another world!
                                </p>
                            </div>
                            <div className="featured-game-card">
                                <span className="badge trending">Trending</span>
                                <img src={featuredGame2} alt="Horizon Zero Dawn" />
                                <h3 className="game-title">Horizon Zero Dawn</h3>
                                <p className="game-description">
                                    High-octane action and non-stop thrills. Are you ready?
                                </p>
                            </div>
                            <div className="featured-game-card">
                                <span className="badge new">New</span>
                                <img src={featuredGame3} alt="Resident Evil III" />
                                <h3 className="game-title">Resident Evil III</h3>
                                <p className="game-description">
                                    A magical journey through stunning landscapes and challenges!
                                </p>
                            </div>
                        </div>

                        <div className="personalized-recom">
                            <h2 className="per-section-title">Recommended for You</h2>
                            <div className="per-recommendation-slider scrolling" ref={sliderRef}>
                                <div className="recommendation-item" data-tooltip="Rating: 9/10 | Genre: RPG | Release: 2016">
                                    <img src={recommendedGame1} alt="Dark Souls III" />
                                    <h3>Diablo</h3>
                                    <p>Explore the dark fantasy world and face epic challenges!</p>
                                    <a href="/game-details/1" className="recom-cta-button">Learn More</a>
                                </div>
                                <div className="recommendation-item" data-tooltip="Rating: 8.5/10 | Genre: Adventure | Release: 2017">
                                    <img src={recommendedGame2} alt="Horizon Zero Dawn" />
                                    <h3>Street Fighter</h3>
                                    <p>Embark on an open-world adventure with stunning visuals!</p>
                                    <a href="/game-details/2" className="recom-cta-button">Learn More</a>
                                </div>
                                <div className="recommendation-item" data-tooltip="Rating: 9.5/10 | Genre: Horror | Release: 2021">
                                    <img src={recommendedGame3} alt="Resident Evil Village" />
                                    <h3>ViewFinder</h3>
                                    <p>Survive in a chilling and immersive horror experience!</p>
                                    <a href="/game-details/3" className="recom-cta-button">Learn More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-games">
                    <div className="container-chart-games">
                        <h2 className="chart-title">Chart Games</h2>

                        {/* Genre Selector */}
                        <div className="genre-selector">
                            <button
                                className="genre-button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {selectedGenre} <span className="dropdown-icon">▼</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {Object.keys(genres).map((genre) => (
                                        <button
                                            key={genre}
                                            className="dropdown-item"
                                            onClick={() => handleGenreChange(genre)}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Genre Chart */}
                        <div className="charts-container">
                            <div className="chart-column">
                                <h3 className="chart-subtitle">Top {selectedGenre} Games</h3>
                                <ul className="chart-list">
                                    {genres[selectedGenre].map((game, index) => (
                                        <li className="chart-item" key={index}>
                                            <span className="rank">{index + 1}</span>
                                            <div className="game-info">
                                                <h4>{game.name}</h4>
                                                <p>Rating: {game.rating}/10</p>
                                            </div>
                                            {/* Progress Bar */}
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${(game.rating / 10) * 100}%`,
                                                    backgroundColor: "#3498db", // You can change color here
                                                }}
                                            ></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="chart-column">
                                <h3 className="chart-subtitle">Top Popularity Games</h3>
                                <ul className="chart-list">
                                    {top5PopularGames.map((game, index) => (
                                        <li className="chart-item" key={index}>
                                            <span className="rank">{index + 1}</span>
                                            <div className="game-info">
                                                <h4>{game.name}</h4>
                                                <p>Popularity: {game.popularity}/10</p>
                                            </div>
                                            {/* Popularity Bar */}
                                            <div
                                                className="popularity-bar"
                                                style={{
                                                    width: `${(game.popularity / 10) * 100}%`,
                                                    backgroundColor: "#e74c3c", // You can change color here
                                                }}
                                            ></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    )
}

export default MainPages;