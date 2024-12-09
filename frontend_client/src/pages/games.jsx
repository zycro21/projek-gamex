import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation here
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "../styles/games.css"; // Your custom CSS styles


const GamesDashboard = () => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(16); // 4x4 cards per page
  const [totalGames, setTotalGames] = useState(0); // Total jumlah data games
  const [totalPages, setTotalPages] = useState(0); // Total halaman
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNewGame, setIsCreatingNewGame] = useState(true); // Default ke true untuk create new game
  const [currentGameId, setCurrentGameId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newGame, setNewGame] = useState({
    title: "",
    genre: [],
    platform: [],
    description: "",
    price: "",
    releaseDate: "",
    image: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page") || 1, 10);

  const validGenres = [
    "Real-Time Strategy",
    "Multiplayer Online Battle Arena",
    "Shooter",
    "Role Playing Game",
    "Sandbox",
    "Simulation",
    "Racing",
    "Sports",
    "Fighting",
    "Action-Adventure",
    "Survival Horror",
    "Puzzler",
    "Rhythm Game",
    "Interactive Movie",
    "Platformer",
  ];

  const validPlatforms = [
    "Personal Computer (PC)",
    "Console",
    "Handheld Game Consoles",
    "Mobile Devices",
    "Virtual Reality (VR)",
  ];

  // Fetch games based on page number
  const fetchGames = async (page = currentPage) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/games?page=${page}&limit=${gamesPerPage}`,
        {
          withCredentials: true, // Mengizinkan pengiriman cookies di permintaan
        }
      );
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

  // Handle page change for pagination
  const handlePageChange = (pageNumber) => {
    console.log("Page changed to:", pageNumber);
    setCurrentPage(pageNumber); // Update state currentPage
    navigate(`/games?page=${pageNumber}&limit=${gamesPerPage}`); // Update URL
  };

  // Handle input change for new or existing game form
  const handleGameChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "genre" || name === "platform") {
      if (type === "checkbox") {
        setNewGame((prev) => {
          const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
          return {
            ...prev,
            [name]: checked
              ? [...currentValues, value] // Add if checked
              : currentValues.filter((v) => v !== value), // Remove if unchecked
          };
        });
      } else {
        setNewGame((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setNewGame((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewGame((prev) => ({ ...prev, image: file }));
  };

  // Handle adding new game
  const handleAddGame = async (e) => {
    e.preventDefault();

    // Pastikan semua data yang diperlukan sudah ada
    const formData = new FormData();
    formData.append("title", newGame.title);
    formData.append("description", newGame.description); // Menambahkan deskripsi
    formData.append("price", newGame.price); // Menambahkan harga
    formData.append("platform", newGame.platform); // Menambahkan platform
    formData.append("genre", newGame.genre); // Menambahkan genre
    formData.append("release_date", newGame.releaseDate); // Menambahkan tanggal rilis
    if (newGame.image) {
      formData.append("image", newGame.image); // Menambahkan gambar jika ada
    }

    try {
      // Mengirim data game ke server
      const response = await axios.post(
        "http://localhost:5000/games/createGames",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Menambahkan kredensial
        }
      );

      // Jika berhasil, refresh daftar game
      fetchGames();
      setNewGame({
        title: "",
        description: "",
        price: "",
        platform: "",
        genre: "",
        release_date: "",
        image: null,
      });
      // Menampilkan notifikasi berhasil
      toast.success("Game berhasil ditambahkan!");
      console.log(response.data.message); // Tampilkan pesan sukses dari server
    } catch (error) {
      console.error(
        "Error adding game:",
        error.response ? error.response.data : error
      );
      // Menampilkan notifikasi gagal
      toast.error("Gagal menambahkan game. Silakan coba lagi.");
    }
  };

  // Handle editing an existing game
  const handleUpdateGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Hanya tambahkan genre jika ada perubahan dan tidak kosong
    if (Array.isArray(newGame.genre) && newGame.genre.length > 0) {
      const genres = newGame.genre
        .filter((genre) => validGenres.includes(genre))
        .join(", ");
      if (genres) formData.append("genre", genres);
    }

    // Hanya tambahkan platform jika ada perubahan dan tidak kosong
    if (Array.isArray(newGame.platform) && newGame.platform.length > 0) {
      const platforms = newGame.platform
        .filter((platform) => validPlatforms.includes(platform))
        .join(", ");
      if (platforms) formData.append("platform", platforms);
    }

    // Tambahkan field lain jika ada perubahan
    if (newGame.title) formData.append("title", newGame.title);
    if (newGame.description)
      formData.append("description", newGame.description);
    if (newGame.price) formData.append("price", newGame.price);
    if (newGame.releaseDate) {
      formData.append(
        "release_date",
        new Date(newGame.releaseDate).toISOString().split("T")[0]
      );
    }
    if (newGame.image) formData.append("image", newGame.image);

    try {
      const response = await axios.put(
        `http://localhost:5000/games/updateGames/${currentGameId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log("Game updated:", response.data);
      fetchGames();
      setIsModalOpen(false);
      toast.success("Game updated successfully!");
    } catch (error) {
      console.error(
        "Error updating game:",
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.data.errors) {
        console.error("Validation Errors:", error.response.data.errors);
      }
      toast.error("Error updating game! Please try again.");
    }
  };

  // Handle Detail Game (belum digunakan)
  const handleDetailGame = async (gameId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/games/getGames/${gameId}`
      );
      const game = response.data;
      setNewGame({
        title: game.title,
        genre: game.genre, // Pastikan ini adalah array
        platform: game.platform, // Pastikan ini juga array
        description: game.description,
        price: game.price,
        releaseDate: game.release_date, // pastikan ini sesuai dengan data
        image: null, // Reset image untuk edit
      });
      setIsEditing(true);
      setCurrentGameId(gameId);
    } catch (error) {
      console.error("Error fetching game for Detail:", error);
    }
  };

  // Handle deleting a game
  const handleDeleteGame = async (gameId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Game ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:5000/games/deletegames/${gameId}`,
          {
            withCredentials: true,
          }
        );

        Swal.fire("Terhapus!", "Game telah berhasil dihapus.", "success");
        fetchGames(); // Refresh daftar game setelah menghapus
        toast.success("Game deleted successfully!"); // Notifikasi sukses
      } catch (error) {
        console.error("Error deleting game:", error);
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus game.", "error");
        toast.error("Error deleting game! Please try again."); // Notifikasi error
      }
    }
  };

  // Handle editing an existing game (form pop-up)
  const handleEditGame = (gameId) => {
    setIsCreatingNewGame(false);
    setCurrentGameId(gameId);
    setIsModalOpen(true); // Buka pop-up

    // Cari game berdasarkan game_id
    const game = games.find((game) => game.game_id === gameId);

    // Jika game ditemukan, set nilai state baru
    if (game) {
      setNewGame({
        title: game.title,
        genre: game.genre,
        description: game.description,
        price: game.price,
        platform: game.platform,
        // Format tanggal dari database (misal dalam format ISO) ke format YYYY-MM-DD
        releaseDate: game.release_date
          ? new Date(game.release_date).toISOString().split("T")[0]
          : "",
        image: null, // Reset image untuk edit
      });
    } else {
      console.error(`Game dengan game_id ${gameId} tidak ditemukan.`);
    }
  };

  // Handle create new game (pop-up form)
  const handleCreateNewGame = () => {
    setIsCreatingNewGame(true); // Menandakan kita sedang membuat game baru
    setNewGame({
      title: "",
      genre: [],
      description: "",
      price: "",
      platform: [],
      releaseDate: "",
      image: null,
    });
    setIsModalOpen(true); // Menampilkan modal
  };

  // Close Pop-Up
  const handleCancelEdit = () => {
    setIsModalOpen(false); // Tutup pop-up tanpa menyimpan perubahan
    setNewGame({
      title: "",
      genre: "",
      description: "",
      price: "",
      platform: "",
      release_date: "",
      image: null,
    });
  };

  const formatPrice = (price) =>
    price <= 0 ? "FREE" : `Rp${Math.floor(price).toLocaleString("id-ID")}`;

  useEffect(() => {
    if (pageFromURL !== currentPage) {
      setCurrentPage(pageFromURL);
    } else {
      fetchGames(pageFromURL);
    }
  }, [location.search]);

  useEffect(() => {
    fetchGames(currentPage); // Fetch games when currentPage changes
  }, [currentPage]);

  // Function to fetch game data based on gameId
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/games/getGame/${currentGameId}`
        );
        const gameData = response.data;

        setNewGame({
          title: gameData.title,
          description: gameData.description,
          price: gameData.price,
          genre: gameData.genre ? gameData.genre.split(",") : [], // split to array
          platform: gameData.platform ? gameData.platform.split(",") : [], // split to array
          releaseDate: gameData.release_date,
          image: null, // Image set to null initially for update
        });
      } catch (error) {
        console.error("Failed to fetch game data:", error);
      }
    };

    if (currentGameId) {
      fetchGameData();
    }
  }, [currentGameId]);

  return (
    <div className="games-dashboard">
      <Sidebar />
      {/* <ToastContainer /> */}
      <div className="title-container">
        <h1 className="title">GAMES DASHBOARD</h1>
        <button
          className="add-game-button"
          onClick={handleCreateNewGame} // Pastikan ini memanggil fungsi yang benar untuk membuat game
        >
          <FaPlus />
          <span className="button-text-add-games">Create New Game</span>
        </button>
      </div>
      <div className="main-content-games">
        <div className="game-cards">
          {games.map((game) => (
            <div className="game-card" key={game.game_id}>
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
                  onClick={() => {
                    handleEditGame(game.game_id);
                    setIsCreatingNewGame(false); // Set ke false saat membuka modal untuk edit game
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-button-game"
                  onClick={() => handleDeleteGame(game.game_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-games-overlay">
          <div className="modal-games-content">
            <h2 className="pop-up-games-edit-title">
              {isCreatingNewGame ? "Create New Game" : "Update Game"}
            </h2>
            <form
              onSubmit={isCreatingNewGame ? handleAddGame : handleUpdateGame}
              className="form-edit-games"
            >
              <label htmlFor="title">Game Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={newGame.title}
                onChange={handleGameChange}
                placeholder="Game Title"
              />

              <label htmlFor="description">Game Description</label>
              <textarea
                name="description"
                id="description"
                value={newGame.description}
                onChange={handleGameChange}
                placeholder="Game Description"
              />

              <label htmlFor="genre">Game Genre</label>
              <details>
                <summary>Select Genre</summary>
                <div className="grid-container">
                  {[
                    "Real-Time Strategy",
                    "Multiplayer Online Battle Arena",
                    "Shooter",
                    "Role Playing Game",
                    "Sandbox",
                    "Simulation",
                    "Racing",
                    "Sports",
                    "Fighting",
                    "Action-Adventure",
                    "Survival Horror",
                    "Puzzler",
                    "Rhythm Game",
                    "Interactive Movie",
                    "Platformer",
                  ].map((genre) => (
                    <label key={genre} className="grid-item">
                      <input
                        type="checkbox"
                        name="genre"
                        value={genre}
                        checked={newGame.genre.includes(genre)}
                        onChange={handleGameChange}
                      />
                      {genre}
                    </label>
                  ))}
                </div>
              </details>

              <label htmlFor="platform" style={{ marginTop: "12px" }}>
                Platform
              </label>
              <details>
                <summary>Select Platform</summary>
                <div className="grid-container">
                  {[
                    "Personal Computer (PC)",
                    "Console",
                    "Handheld Game Consoles",
                    "Mobile Devices",
                    "Virtual Reality (VR)",
                  ].map((platform) => (
                    <label key={platform} className="grid-item">
                      <input
                        type="checkbox"
                        name="platform"
                        value={platform}
                        checked={newGame.platform.includes(platform)}
                        onChange={handleGameChange}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </details>

              <label htmlFor="price" style={{ marginTop: "10px" }}>
                Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={newGame.price}
                onChange={handleGameChange}
                placeholder="Price"
              />

              <label htmlFor="releaseDate" style={{ marginTop: "10px" }}>
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                id="releaseDate"
                value={newGame.releaseDate}
                onChange={handleGameChange}
              />

              <label htmlFor="image" style={{ marginTop: "10px" }}>
                Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                onChange={handleFileChange}
              />

              <div className="modal-game-edit-buttons">
                <button
                  type="submit"
                  className="confirm-edit-game-btn edit-game-btn"
                >
                  {isCreatingNewGame ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  className="cancel-edit-game-btn edit-game-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      </div>
      <ToastContainer />
    </div>
  );
};

export default GamesDashboard;
