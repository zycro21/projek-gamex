import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Sidebar from "./sidebar";
import "../styles/games.css"; // Your custom CSS styles
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GamesDashboard = () => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(16); // 4x4 cards per page
  const [newGame, setNewGame] = useState({
    title: "",
    genre: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(null);
  const navigate = useNavigate();


  const fetchGames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/games", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGames(response.data.games); 
    console.log(response.data.games);
    } catch (error) {
        console.error("Error fetching games:", error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Pagination Logic
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

  const totalPages = Math.ceil(games.length / gamesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  return (
    <div className="games-dashboard">
      <Sidebar />
      <h1>Games Dashboard</h1>

      <div className="game-cards">
        {currentGames.map((game) => (
          <div className="game-card" key={game._id}>
            <img
              src={`http://localhost:5000/uploads/${game.image}`}
              alt={game.title}
            />
            <h3>{game.title}</h3>
            <p>{game.genre}</p>
            <button onClick={() => handleEditGame(game._id)}>Edit</button>
            <button onClick={() => handleDeleteGame(game._id)}>Delete</button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
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
          placeholder="Game Title"
          value={newGame.title}
          onChange={handleGameChange}
          required
        />
        <input
          type="text"
          name="genre"
          placeholder="Game Genre"
          value={newGame.genre}
          onChange={handleGameChange}
          required
        />
        <input type="file" name="image" onChange={handleFileChange} />
        <button type="submit">{isEditing ? "Update Game" : "Add Game"}</button>
      </form>
    </div>
  );
};

export default GamesDashboard;
