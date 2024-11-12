import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation here
import axios from "axios";
import Sidebar from "./sidebar";
import "../styles/games.css"; // Your custom CSS styles
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GamesDashboard = () => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(16); // 4x4 cards per page
  const [totalGames, setTotalGames] = useState(0); // Total jumlah data games
  const [totalPages, setTotalPages] = useState(0); // Total halaman

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page") || 1, 10);
  const limitFromURL = parseInt(queryParams.get("limit") || 16, 10);

  const [newGame, setNewGame] = useState({
    title: "",
    genre: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(null);

  // Fetch games function
  const fetchGames = async (page = currentPage) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/games?page=${page}&limit=${gamesPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("API Response:", response.data);
      setGames(response.data.games);
      setTotalGames(response.data.totalGames);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(
        "Error fetching games:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    if (pageFromURL !== currentPage) {
      setCurrentPage(pageFromURL);
    } else {
      fetchGames(pageFromURL);
    }
  }, [location.search]);

  useEffect(() => {
    console.log("Current Page:", currentPage);
    fetchGames(currentPage); // Fetch games when currentPage changes
  }, [currentPage]);

  // Pagination Logic
  const handlePageChange = (pageNumber) => {
    console.log("Page changed to:", pageNumber);
    setCurrentPage(pageNumber); // Update state currentPage
    navigate(`/games?page=${pageNumber}&limit=${gamesPerPage}`); // Update URL
  };

  const handleGameChange = (e) => {
    const { name, value } = e.target;
    setNewGame((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewGame((prev) => ({ ...prev, image: file }));
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newGame.title);
    formData.append("genre", newGame.genre);
    formData.append("image", newGame.image);

    try {
      await axios.post("http://localhost:5000/games/createGames", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchGames(); // Refresh the list after adding the game
      setNewGame({ title: "", genre: "", image: null });
    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const handleEditGame = async (gameId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/games/getGame/${gameId}`
      );
      const game = response.data;
      setNewGame({ title: game.title, genre: game.genre, image: null });
      setIsEditing(true);
      setCurrentGameId(gameId);
    } catch (error) {
      console.error("Error fetching game for editing:", error);
    }
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newGame.title);
    formData.append("genre", newGame.genre);
    if (newGame.image) {
      formData.append("image", newGame.image);
    }

    try {
      await axios.put(
        `http://localhost:5000/games/updateGame/${currentGameId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchGames(); // Refresh the list after updating the game
      setNewGame({ title: "", genre: "", image: null });
      setIsEditing(false);
      setCurrentGameId(null);
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await axios.delete(`http://localhost:5000/games/deleteGame/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchGames(); // Refresh the list after deleting the game
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  function formatPrice(price) {
    return price <= 0 ? "FREE" : `Rp${Math.floor(price).toLocaleString("id-ID")}`;
  }

  return (
    <div className="games-dashboard">
      <Sidebar />
      <div className="title-container">
        <h1 className="title">GAMES DASHBOARD</h1>
      </div>
      <div className="main-content-games">
        <div className="game-cards">
          {games.map((game) => (
            <div className="game-card" key={game._id}>
              <img
                className="image-game"
                src={`http://localhost:5000/uploads/${game.image}`}
                alt={game.title}
              />
              <p className="title-game">{game.title}</p>
              <p className="price-game">{formatPrice(game.price)}</p>
              <div className="button-container-game">
                <button
                  className="edit-button-game"
                  onClick={() => handleEditGame(game._id)}
                >
                  Edit
                </button>
                <button
                  className="delete-button-game"
                  onClick={() => handleDeleteGame(game._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content-games-2">
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <h2>{isEditing ? "Edit Game" : "Add New Game"}</h2>
        <form onSubmit={isEditing ? handleUpdateGame : handleAddGame}>
          <input
            type="text"
            name="title"
            value={newGame.title}
            onChange={handleGameChange}
            placeholder="Game Title"
          />
          <input
            type="text"
            name="genre"
            value={newGame.genre}
            onChange={handleGameChange}
            placeholder="Game Genre"
          />
          <input type="file" onChange={handleFileChange} />
          <button type="submit">{isEditing ? "Update" : "Add"}</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GamesDashboard;
