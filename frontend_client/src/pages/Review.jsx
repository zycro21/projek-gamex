import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "../styles/Review.css";

const ReviewDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    review_id: null,
    user_id: "",
    game_id: "",
    rating: "",
    review_text: "",
  }); // State untuk form create review
  const [games, setGames] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPage, setGameTotalPage] = useState(0);
  const [showGamePopUp, setShowGamePopUp] = useState(false);

  const limit = 10; // Jumlah Review Per Page nya

  // Function untuk fetch reviews
  const fetchReviews = async (page = 1, searchQuery = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/review", {
        params: { page, limit, search: searchQuery },
        withCredentials: true,
      });

      const { data, pagination } = response.data; // Ambil data dan info pagination dari respon API
      setReviews(data); // Set data ke reviews state
      setReviewTotalPages(pagination.totalPages); // Set total halaman
      setCurrentPage(pagination.page); // Set halaman aktif (halaman saat ini)
    } catch (err) {
      console.error("Error Fetching Reviews: ", err);
      setError("Gagal memuat data reviews, silahkan coba lagi"); // Menampilkan pesan error
    } finally {
      setLoading(false);
    }
  };

  // Function untuk create dan update review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      if (newReview.review_id) {
        // Mode Edit: Panggil API untuk Update
        const response = await axios.put(
          `http://localhost:5000/review/${newReview.review_id}`,
          {
            rating: newReview.rating,
            review_text: newReview.review_text,
          },
          { withCredentials: true }
        );
        toast.success(response.data.message);
      } else {
        // Mode Create: Panggil API untuk create
        const response = await axios.post(
          "http://localhost:5000/review/createReviews",
          newReview,
          { withCredentials: true }
        );
        toast.success(response.data.message);
      }

      // Close Modal dan Refresh Data
      setShowReviewModal(false);
      setNewReview({
        review_id: null,
        user_id: "",
        game_id: "",
        rating: "",
        review_text: "",
      });
      fetchReviews(currentPage, search);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal Menambahkan Review. Coba Lagi"
      );
    }
  };

  const handleOpenReviewModal = (review = null) => {
    if (review) {
      // Mode Edit
      setNewReview(review);
    } else {
      setNewReview({
        review_id: null,
        user_id: "",
        game_id: "",
        rating: "",
        review_text: "",
      });
    }
    setShowReviewModal(true);
  };

  // Fungsi untuk menangani perubahan input pada form create dan update review
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value,
    });
  };

  // Function fetch daftar game untuk isi form
  const fetchGames = async (page = 1, limit = 10) => {
    try {
      console.log(`Fetching page: ${page}`);
      const response = await axios.get("http://localhost:5000/games", {
        params: { page, limit },
        withCredentials: true,
      });

      const { games, totalGames, totalPages } = response.data;
      console.log("API Response:", response.data);

      // Simpan data ke state
      setGames(games);
      // setTotalGames(totalGames);
      setGameTotalPage(totalPages);
      // setCurrentPage(page);
    } catch (err) {
      console.error(
        "Error Fetching Games: ",
        err.response ? err.response.data : err.message
      );
    }
  };

  // Buka Pop-Up dan Fetch Data Game
  const handleOpenGamePopUp = () => {
    fetchGames(gameCurrentPage); // Ambil data games dari fetchgames
    setShowGamePopUp(true);
  };

  // Pilih Game Dari Pop-Up
  const handleSelectGame = (gameId) => {
    setNewReview({
      ...newReview,
      game_id: gameId,
    });
    setShowGamePopUp(false);
  };

  // Pagination game-review
  const handleNextGamePage = () => {
    if (gameCurrentPage < gameTotalPage) {
      setGameCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousGamePage = () => {
    if (gameCurrentPage > 1) {
      setGameCurrentPage((prev) => prev - 1);
    }
  };

  // Fungsi Delete Review
  const handleDeleteReview = async (review_id) => {
    const result = await Swal.fire({
      title: "Apakah anda yakin?",
      text: `Anda akan menghapus review dengan ID: ${review_id}. Aksi ini akan menghapus permanen data review`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:5000/review/${review_id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
            progress: undefined,
          });
          fetchReviews(currentPage, search);
        }
      } catch (err) {
        console.error("Error delete review: ", err);
        toast.error(
          error.response?.data?.message ||
            "Error Ketika Proses Menghapus Review.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < reviewTotalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Memuat data saat komponen pertama kali dirender dan ketika currentpage atau search berubah
  useEffect(() => {
    fetchReviews(currentPage, search);
  }, [currentPage, search]);

  useEffect(() => {
    // Memanggil fetchGames setiap  currentPage pada game berubah
    fetchGames(gameCurrentPage, limit);
  }, [gameCurrentPage]);

  // Fungsi untuk menangani pencarian
  const handleSearch = () => {
    setCurrentPage(1); // Resetnya ke halaman 1
    fetchReviews(1, search); // Ambil data yang sesuai dengan kata kunci pencarian
  };

  return (
    <div className="review-dashboard">
      <ToastContainer />
      <Sidebar />
      <div className="review-title-container">
        <h1 className="review-title">REVIEW DASHBOARD</h1>
        <button
          className="add-review-button"
          onClick={() => handleOpenReviewModal()}
        >
          <FaPlus />
          <span className="button-text-add-reviews">Create Review</span>
        </button>
      </div>

      {/* Loading and Error */}
      {loading && <p className="loading-review">Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Tabel Data Reviews */}
      {!loading && !error && (
        <div className="main-content-reviews">
          <table className="review-table">
            <thead>
              <tr>
                <th>ID Review</th>
                <th>User ID</th>
                <th>Rating</th>
                <th>Review Text</th>
                <th>Tanggal Dibuat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.review_id}>
                    <td>{review.review_id}</td>
                    <td>{review.user_id}</td>
                    <td className="rating-column">{review.rating}</td>
                    <td>{review.review_text}</td>
                    <td>
                      {(() => {
                        const date = new Date(review.review_date);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = date.getFullYear();
                        return `${day} - ${month} - ${year}`;
                      })()}
                    </td>
                    <td>
                      <div className="review-action-button">
                        <button
                          className="review-edit-button"
                          onClick={() => handleOpenReviewModal(review)}
                        >
                          Edit
                        </button>
                        <button className="review-delete-button" onClick={() => handleDeleteReview(review.review_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Tidak ada Review yang ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal (Pop-Up Form) */}
      {showReviewModal && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h2>Create New Review</h2>
            <form onSubmit={handleSubmitReview} className="form-review">
              <label>
                User ID:
                <input
                  type="text"
                  name="user_id"
                  value={newReview.user_id}
                  onChange={handleInputChange}
                  placeholder="ID User"
                />
              </label>
              <label>
                Game:
                <input
                  type="text"
                  name="game_id"
                  value={newReview.game_id}
                  readOnly
                  onClick={handleOpenGamePopUp}
                  placeholder="Pilih Game yang Akan Direview"
                />
              </label>
              <label>
                Rating:
                <input
                  type=""
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  placeholder="Rating"
                />
              </label>
              <label>
                Penilaian (Komentar):
                <textarea
                  name="review_text"
                  id="review_text"
                  value={newReview.review_text}
                  onChange={handleInputChange}
                  placeholder="Komentar"
                />
              </label>

              {/* Tombol Action */}
              <div className="review-modal-actions">
                <button className="review-confirm-btn" type="submit">
                  Confirm
                </button>
                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-Up Pilihan Game */}
      {showGamePopUp && (
        <div className="review-game-popup-modal">
          <div className="review-game-popup-modal-content">
            <h2>Choose The Game</h2>
            <ul>
              {games.length > 0 ? (
                games.map((game) => (
                  <li key={game.game_id}>
                    <div className="review-game-item">
                      <p className="review-game-item">{game.title}</p>
                      <p className="review-game-id">{game.game_id}</p>
                      <button onClick={() => handleSelectGame(game.game_id)}>
                        Select
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>Loading Games...</p>
              )}
            </ul>
            {/* Navigation Buttons for Pagination */}
            <div className="review-game-pagination">
              <button
                disabled={gameCurrentPage === 1}
                onClick={handlePreviousGamePage}
              >
                Previous
              </button>
              <span>
                Page {gameCurrentPage} of {gameTotalPage}
              </span>
              <button
                disabled={gameCurrentPage === gameTotalPage}
                onClick={handleNextGamePage}
              >
                Next
              </button>
            </div>
            <button
              className="review-game-close-btn"
              onClick={() => setShowGamePopUp(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="main-content-reviews-2">
        <div className="pagination-review">
          <button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className="review-pagination-button"
          >
            Before
          </button>
          <span className="review-pagination-info">
            Halaman {currentPage} dari {reviewTotalPages}
          </span>
          <button
            disabled={currentPage === reviewTotalPages}
            onClick={handleNextPage}
            className="review-pagination-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;
