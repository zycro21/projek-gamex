import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaPlus, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "../styles/Wishlist.css";

const WishlistDashboard = () => {
  // State untuk Fetch Wishlist
  const [wishlists, setWishlists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk create
  const [showPopUp, setShowPopUp] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    title_wishlist: "",
    game_id: "",
  });
  const [errors, setErrors] = useState({});

  // State untuk details
  const [showDetailWishlistPopUp, setShowDetailWishlistPopUp] = useState(false);
  const [wishlistGames, setWishlistGames] = useState([]);
  const [wishlistDetail, setWishlistDetail] = useState(null);
  const [gameDetailCurrentPage, setGameDetailCurrentPage] = useState(1);
  const [gameDetailTotalPages, setGameDetailTotalPages] = useState(1);
  const [detailLoading, setDetailLoading] = useState(false);

  // State untuk edit wishlist
  const [showEditWishlistPopup, setShowEditWishlistPopup] = useState(false);
  const [editFormWishlistData, setEditFormWishlistData] = useState({
    title_wishlist: "",
    selectedGames: [],
  });
  const [selectedGamesIds, setSelectedGameIds] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [gameSelectPopupVisible, setGameSelectPopupVisible] = useState(false);
  const [gameWishlistCurrentPage, setGameWishlistCurrentPage] = useState(1);
  const [gameWishlistTotalPage, setGameWishlistTotalPage] = useState(1);

  const navigate = useNavigate();

  // Fetch Wishlist Data
  const FetchWishlist = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/wishlist/?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Full Response: ", response);
      console.log("Hasil Wishlist Response: ", response.data);

      // Memastikan Struktur Data Sesuai
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Set State dengan data dari response
        setWishlists(response.data.data);

        // Set Metadata
        setCurrentPage(response.data.metadata.currentPage);
        setTotalPages(response.data.metadata.totalPages);
        setTotalItems(response.data.metadata.totalItems);

        console.log("Wishlist Data Set: ", response.data.data);
      } else {
        throw new Error("Format Data Tidak Valid");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error Detail: ", err);

      if (err.response) {
        console.error("Error response: ", err.response.data);
      }

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal melakukan fetching wishlist";

      // Reset State dalam kasus error
      setWishlists([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalItems(0);

      // Tampilkan Error
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Fetch Detail Wishlist
  const FetchWishlistDetail = async (wishlistId, page = 1) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/wishlist/${wishlistId}?gamePage=${page}&gameLimit=16`,
        {
          withCredentials: true,
        }
      );

      const { wishlist, game, metadata } = response.data;

      // Log data yang diterima
      console.log("Data fetched for wishlist: ", wishlist);
      console.log("Game data fetched: ", game);
      console.log("Metadata fetched: ", metadata);

      setWishlistDetail(wishlist[0]);

      console.log(
        "After setWishlistDetail (state might not update immediately): ",
        wishlistDetail
      );

      setWishlistGames(response.data.game);
      setGameDetailCurrentPage(metadata.currentGamePage);
      setGameDetailTotalPages(metadata.totalGamePages);

      setShowDetailWishlistPopUp(true);
    } catch (error) {
      console.error("Error Fetching Wishlist Detail: ", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch wishlist detail"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGameWishhlistPageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      FetchWishlistDetail(wishlistDetail.wishlist_id, newPage);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Menangani Perubahan Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Fungsi untuk eksekusi create wishlist
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset Error State

    try {
      console.log({
        user_id: formData.user_id,
        title_wishlist: formData.title_wishlist,
        game_id: formData.game_id.split(",").map((id) => id.trim()),
      });

      const response = await axios.post(
        "http://localhost:5000/wishlist/createWishlist",
        {
          user_id: formData.user_id,
          title_wishlist: formData.title_wishlist,
          game_id: formData.game_id.split(",").map((id) => id.trim()),
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!formData.user_id || !formData.title_wishlist || !formData.game_id) {
        toast.error("Semua field harus diisi!");
        return;
      }

      toast.success(response.data.message || "Wishlist Successfully Created");
      setShowPopUp(false);
      setFormData({ user_id: "", title_wishlist: "", game_id: "" }); // Reset Form
      FetchWishlist();
    } catch (error) {
      console.error("Error Response: ", error.response?.data);
      toast.error(error.response?.data?.message || "An error occurred");

      if (error.response && error.response.data.errors) {
        // Handle Validation Errors
        const validationErrors = {};
        error.response.data.errors.forEach((err) => {
          validationErrors[err.param] = err.msg;
        });
        setErrors(validationErrors);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to Create Wishlist"
        );
      }
    }
  };

  // Initial Fetch
  useEffect(() => {
    FetchWishlist();
  }, []);

  // Handle Page Chance
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      FetchWishlist(newPage);
    }
  };

  // Fungsi Menu Edit
  // Fungsi Untuk Mengambil data berdasarkan wishlist_id
  const FetchWishlistEditData = async (wishlistId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/wishlist/${wishlistId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const wishlistData = response.data.wishlist;

        setEditFormWishlistData({
          wishlist_id: wishlistData.wishlist_id,
          title_wishlist: wishlistData.title_wishlist,
          selectedGames: wishlistData.games || [],
        });

        // Set State ID Game yang Dipilih
        setSelectedGameIds(
          wishlistData.games?.map((game) => game.game_id) || []
        );

        setShowEditWishlistPopup(true);
      }
    } catch (error) {
      console.error("Error Fetching Wishlist Data: ", error);
      toast.error("Failed to fetch wishlist data for editing");
    }
  };

  // Handle Edit Wishlist Click Button
  const handleEditWishlistClick = (wishlist) => {
    FetchWishlistEditData(wishlist.wishlist_id);
  };

  // Fetch Available Games
  const FetchAvailableGames = async (page = 1, limit = 16) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/games?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response Data:", response.data);

      const { games, totalPages, currentPage } = response.data;

      if (response.data.games && Array.isArray(response.data.games)) {
        setAvailableGames(response.data.games);
        setGameWishlistCurrentPage(response.data.currentPage); // Update current page
        setGameWishlistTotalPage(response.data.totalPages); // Update total pages

        // Tambahkan log di sini
        console.log("Available Games:", games);
        console.log("Current Page:", currentPage);
        console.log("Total Pages:", totalPages);
      } else {
        throw new Error("Invalid API Response Structure");
      }
    } catch (error) {
      console.error("Error Fetching Available Games: ", error);
      toast.error("Failed to fetch available games");
    }
  };

  // Toogle Game Select PopUp Visibility
  const toogleGameSelectPopup = () => {
    setGameSelectPopupVisible(!gameSelectPopupVisible);

    // Fetch Game Data when Opening the PopUp
    if (!gameSelectPopupVisible) {
      FetchAvailableGames();
    }
  };

  // Add Game to Local State
  const handleEditSelectGame = async (gameId) => {
    if (!selectedGamesIds.includes(gameId)) {
      setSelectedGameIds((prev) => [...prev, gameId]);
    } else {
      toast.warning("Game Already Added");
    }
  };

  // Remove Game from selection (remove game from wishlist)
  const handleEditRemoveGame = async (gameId) => {
    setSelectedGameIds((prev) => prev.filter((id) => id !== gameId));
  };

  // Confirm Edit (Menggabungkan API perubahan title dan Selected Games)
  const handleConfirmEdit = async () => {
    const { wishlist_id, title_wishlist } = editFormWishlistData;

    try {
      // Update Title Jika Berubah
      if (title_wishlist.trim()) {
        await axios.put(
          `http://localhost:5000/wishlist/${wishlist_id}`,
          { title_wishlist },
          { withCredentials: true }
        );
        console.log("Title Wishlist Berhasil Diupdate");
      }

      // Update Game (Tambah dan Kurang)
      // Bandingkan Games di awal dengan games yang sekarang dipilih
      const initialGameIds = editFormWishlistData.selectedGames.map(
        (game) => game.game_id
      );
      const addedGames = selectedGamesIds.filter(
        (id) => !initialGameIds.includes(id)
      );
      const removedGames = initialGameIds.filter(
        (id) => !selectedGamesIds.includes(id)
      );

      // Tambahkan Game Baru Jika Ada
      if (addedGames.length > 0) {
        await axios.put(
          `http://localhost:5000/wishlist/plus/${wishlist_id}`,
          { game_id: addedGames },
          { withCredentials: true }
        );
        console.log("Game Berhasil Ditambahkan: ", addedGames);
      }

      // Hapus Game Jika Ada
      if (removedGames.length > 0) {
        await axios.put(
          `http://localhost:5000/wishlist/minus/${wishlist_id}`,
          { game_id: removedGames },
          { withCredentials: true }
        );
        console.log("Game Berhasil Dihapus: ", removedGames);
      }

      // Notifikasi Sukses
      toast.success("Wishlist Berhasil Diperbarui");

      // Fetch Ulang Data Wishlist
      FetchWishlist();
    } catch (error) {
      console.error("Error Confirming Edit: ", error);
      toast.error(
        error.response?.data?.message || "Gagal Memperbarui Wishlist"
      );
    }
  };

  // Delete Wishlist
  const handleDeleteWishlist = async (wishlist_id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data wishlist dan semua game terkait akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/wishlist/${wishlist_id}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast.success("Wishlist berhasil dihapus!");
          FetchWishlist(currentPage);
        }
      } catch (error) {
        console.error("Error deleting wishlist:", error);
        toast.error(
          error.response?.data?.message || "Gagal menghapus wishlist."
        );
      }
    }
  };

  return (
    <div className="wishlist-dashboard">
      <ToastContainer />
      <Sidebar />
      <div className="wishlist-main-container">
        <h1 className="wishlist-title">WISHLIST DASHBOARD</h1>
        <button
          className="add-wishlist-button"
          onClick={() => setShowPopUp(true)}
        >
          <FaPlus />
          <span className="button-text-add-wishlist">Create Wishlist</span>
        </button>
      </div>

      {showPopUp && (
        <div className="popup-container-wishlist">
          <div className="popup-form-wishlist">
            <h2>Create New Wishlist</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group-wishlist">
                <label htmlFor="user_id">User ID</label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  placeholder="Enter User ID"
                />
                {errors.user_id && (
                  <span className="error-wishlist-popup">{errors.user_id}</span>
                )}
              </div>
              <div className="form-group-wishlist">
                <label htmlFor="title_wishlist">Judul Wishlist</label>
                <input
                  type="text"
                  id="title_wishlist"
                  name="title_wishlist"
                  value={formData.title_wishlist}
                  onChange={handleInputChange}
                  placeholder="Enter Wishlist Title"
                />
                {errors.title_wishlist && (
                  <span className="error-wishlist-group">
                    {errors.title_wishlist}
                  </span>
                )}
              </div>
              <div className="form-group-wishlist">
                <label htmlFor="game_id">Game ID</label>
                <input
                  type="text"
                  id="game_id"
                  name="game_id"
                  value={formData.game_id}
                  onChange={handleInputChange}
                  placeholder="Enter Game ID (e.g game1, game2)"
                />
                {errors.game_id && (
                  <span className="error-wishlist-group">{errors.game_id}</span>
                )}
              </div>
              <div className="wishlist-popup-form-actions">
                <button type="submit" className="wishlist-submit-popup-form">
                  Submit
                </button>
                <button
                  type="button"
                  className="wishlist-cancel-popup-form"
                  onClick={() => setShowPopUp(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="wishlist-loading-indicator">Loading...</div>
      ) : error ? (
        <div className="wishlist-error-message">{error}</div>
      ) : wishlists.length === 0 ? (
        <div className="wishlist-empty-state">No wishlist found</div>
      ) : (
        <>
          <div className="main-content-wishlist">
            <table className="wishlist-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Wishlist Title</th>
                  <th>User ID</th>
                  <th>Created at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlists.map((wishlist, index) => (
                  <tr key={wishlist.wishlists_id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>{wishlist.title_wishlist}</td>
                    <td>{wishlist.user_id}</td>
                    <td>
                      {new Date(wishlist.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="wishlist-action-buttons">
                        <button
                          className="wishlist-detail-button"
                          onClick={() =>
                            FetchWishlistDetail(wishlist.wishlist_id)
                          }
                        >
                          <FaEye />
                        </button>
                        <button
                          className="wishlist-edit-button"
                          onClick={() => handleEditWishlistClick(wishlist)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="wishlist-delete-button"
                          onClick={() =>
                            handleDeleteWishlist(wishlist.wishlist_id)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PopUp Detail Wishlist */}
            {showDetailWishlistPopUp && (
              <div className="wishlist-detail-popup-overlay">
                <div className="wishlist-detail-popup-content">
                  <h2>Detail Wishlist</h2>
                  {wishlistDetail && (
                    <div className="wishlist-detail">
                      <p>
                        <strong>Wishlist Title:</strong>{" "}
                        {wishlistDetail.title_wishlist}
                      </p>
                      <p>
                        <strong>Created at:</strong>{" "}
                        {wishlistDetail.created_at
                          ? formatDate(wishlistDetail.created_at)
                          : "N/A"}
                      </p>
                    </div>
                  )}

                  {detailLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <>
                      <div className="wishlist-game-cards-container">
                        {wishlistGames.map((game) => (
                          <div
                            className="wishlist-game-card"
                            key={game.game_id}
                          >
                            <img
                              src={`http://localhost:5000/uploads/${game.image}`}
                              alt={game.title}
                              className="wishlist-game-image"
                            />
                            <h3>{game.title}</h3>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Games */}
                      <div className="wishlist-games-pagination">
                        <button
                          onClick={() =>
                            handleGameWishhlistPageChange(
                              gameDetailCurrentPage - 1
                            )
                          }
                          disabled={gameDetailCurrentPage === 1}
                        >
                          Previous
                        </button>
                        <span>
                          Page {gameDetailCurrentPage} of {gameDetailTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            handleGameWishhlistPageChange(
                              gameDetailCurrentPage + 1
                            )
                          }
                          disabled={
                            gameDetailCurrentPage === gameDetailTotalPages
                          }
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Tombol Close */}
                  <button
                    className="wishlist-detail-close-popup-button"
                    onClick={() => setShowDetailWishlistPopUp(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Wishlist Pop Up */}
      {showEditWishlistPopup && (
        <div className="edit-wishlist-popup-overlay">
          <div className="edit-wishlist-popup">
            <h2>Edit Wishlist</h2>
            <input
              type="text"
              value={editFormWishlistData.title_wishlist}
              onChange={(e) =>
                setEditFormWishlistData((prev) => ({
                  ...prev,
                  title_wishlist: e.target.value,
                }))
              }
              placeholder="Enter New Wishlist Title"
            />
            <button onClick={toogleGameSelectPopup}>Select Games</button>
            <div>
              <h3>Selected Games</h3>
              <ul>
                {selectedGamesIds.map((gameId) => (
                  <li key={gameId}>
                    {gameId}{" "}
                    <button onClick={() => handleEditRemoveGame(gameId)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="edit-wishlist-popup-buttons">
              <button
                className="edit-wishlist-confirm-button"
                onClick={handleConfirmEdit}
              >
                Confirm
              </button>
              <button
                className="edit-wishlist-cancel-button"
                onClick={() => setShowEditWishlistPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Select PopUp */}
      {gameSelectPopupVisible && (
        <GameSelectPopUp
          availableGames={availableGames}
          onSelectGame={handleEditSelectGame}
          onClose={toogleGameSelectPopup}
          gameWishlistCurrentPage={gameWishlistCurrentPage}
          gameWishlistTotalPage={gameWishlistTotalPage}
          setGameWishlistCurrentPage={setGameWishlistCurrentPage}
          FetchAvailableGames={FetchAvailableGames}
        />
      )}

      <div className="main-content-wishlist-2">
        <div className="wishlist-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Game Select PopUp Component
const GameSelectPopUp = ({
  availableGames,
  onSelectGame,
  onClose,
  gameWishlistCurrentPage,
  gameWishlistTotalPage,
  setGameWishlistCurrentPage,
  FetchAvailableGames,
}) => {
  // Log sebelum data digunakan di dalam komponen
  console.log("Available Games:", availableGames);
  console.log("Current Page:", gameWishlistCurrentPage);
  console.log("Total Pages:", gameWishlistTotalPage);

  const handleGameNextPage = () => {
    if (gameWishlistCurrentPage < gameWishlistTotalPage) {
      const nextPage = gameWishlistCurrentPage + 1;
      FetchAvailableGames(nextPage);
    }
  };

  const handleGamePrevPage = () => {
    if (gameWishlistCurrentPage > 1) {
      const prevPage = gameWishlistCurrentPage - 1;
      FetchAvailableGames(prevPage);
    }
  };

  return (
    <div className="game-edit-wishlist-popup-overlay">
      <div className="game-edit-wishlist-popup">
        <h2>Select Game</h2>
        <ul className="game-edit-wishlist-game-list">
          {availableGames.map((game, index) => (
            <li key={game.game_id}>
              <span className="game-number">
                {index + 1 + (gameWishlistCurrentPage - 1) * 16}
              </span>
              <span className="game-title">{game.title}</span>
              <button
                className="game-edit-wishlist-add-button"
                onClick={() => onSelectGame(game.game_id)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        <div className="game-edit-wishlist-popup-pagination">
          <button
            className="game-edit-wishlist-pagination-button"
            onClick={handleGamePrevPage}
            disabled={gameWishlistCurrentPage === 1}
          >
            Previous
          </button>
          <span className="game-edit-wishlist-popup-indicator">
            Page {gameWishlistCurrentPage} of {gameWishlistTotalPage}
          </span>
          <button
            className="game-edit-wishlist-pagination-button"
            onClick={handleGameNextPage}
            disabled={gameWishlistCurrentPage === gameWishlistTotalPage}
          >
            Next
          </button>
        </div>

        <button onClick={onClose} className="game-edit-wishlist-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default WishlistDashboard;
