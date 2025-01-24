import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaPlus, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "../styles/Order.css";

const OrderDashboard = () => {
  // State untuk Fetch Data
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State untuk filter aktif
  const [activeFilter, setActiveFilter] = useState("");
  const [filters, setFilters] = useState({
    payment_status: "",
    order_date: "",
    min_total_price: "",
    max_total_price: "",
  });
  const [sortOrder, setSortOrder] = useState({
    order_date: "DESC",
    total_price: "DESC",
  });

  // State untuk create order and order_items
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    total_price: "",
    payment_status: "pending",
  });
  const [isGameSelectionModalOpen, setIsGameSelectionModalOpen] =
    useState(false);
  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPage, setGameTotalPage] = useState(1);

  // State untuk detail_order
  const [orderDetail, setOrderDetail] = useState(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

  // Fetch All Orders
  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const filterParams = { ...filters };
      if (filterParams.payment_status === "all") {
        delete filterParams.payment_status;
      }

      const queryParams = new URLSearchParams({
        page,
        ...filterParams,
        order_data_sort: sortOrder.order_date,
        total_price_sort: sortOrder.total_price,
      });

      const response = await axios.get(
        `http://localhost:5000/order?${queryParams.toString()}`,
        { withCredentials: true }
      );

      const { data, pagination } = response.data;

      setOrders(data);
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Error Fetching Orders: ", error);
      setError(
        error.response?.data?.message || "Terjadi Kesalahan Saat Memuat Data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, filters]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Fungsi untuk mengubah filter
  const handleLocalFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  // Fungsi Sorting
  const toggleSort = (column) => {
    setSortOrder((prev) => ({
      ...prev,
      [column]: prev[column] === "ASC" ? "DESC" : "ASC",
    }));
    fetchOrders(currentPage);
  };

  // Fetch Detail Order based on order_id
  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/order/${orderId}`,
        {
          withCredentials: true,
        }
      );
      setOrderDetail(response.data.orderDetails);
      setIsModalDetailOpen(true);
    } catch (err) {
      console.error("Error Fetching Data: ", err);
      toast.error(
        err.response?.data?.message || "Terjadi kesalahan saat mengambil data"
      );
    }
  };

  // Menutup Modal Detail
  const closeDetailModal = () => {
    setIsModalDetailOpen(false);
    setOrderDetail(null);
  };

  // Fetch All Games
  const fetchGames = async (page = 1, genre = "", platform = "", sort = "") => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 16,
        genre,
        platform,
        sort,
      });

      const response = await axios.get(
        `http://localhost:5000/games?${queryParams.toString()}`,
        { withCredentials: true }
      );

      const { games, currentPage, totalPages } = response.data;
      setGames(games);
      setGameCurrentPage(currentPage);
      setGameTotalPage(totalPages);
    } catch (error) {
      console.error("Error Fetching Games: ", error);
      toast.error(error.response?.data?.message || "Error fetching games");
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleGamePageChange = (newPage) => {
    if (newPage > 0 && newPage <= gameTotalPage) {
      fetchGames(newPage);
    }
  };

  // Menghitung Total Harga Otomatis
  const calculateTotalPrice = () => {
    return selectedGames.reduce((total, game) => {
      return total + game.price * game.quantity;
    }, 0);
  };

  // Handle Pilihan Game
  const handleGameSelection = (game) => {
    if (!selectedGames.some((g) => g.game_id === game.game_id)) {
      setSelectedGames((prev) => [...prev, { ...game, quantity: 1 }]);
      toast.success(`${game.title} berhasil ditambahkan!`, {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  // Handle Kuantitas Game
  const handleQuantitChange = (gameId, quantity) => {
    setSelectedGames((prev) =>
      prev.map((game) =>
        game.game_id === gameId
          ? { ...game, quantity: parseInt(quantity) }
          : game
      )
    );
  };

  // Confirm Selected Games
  const confirmSelectedGames = () => {
    const total = calculateTotalPrice();
    setFormData((prev) => ({ ...prev, total_price: total }));
    toast.success("Games Berhasil Dikonfirmasi", {
      position: "top-right",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
    setIsGameSelectionModalOpen(false);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Modal
  const openModal = () => setModal(true);

  // Close Modal
  const closeModal = () => {
    setModal(false);
    setFormData({
      user_id: "",
      total_price: "",
      payment_status: "pending",
    });

    setSelectedGames([]);
  };

  // Handle Form Submit
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    const total_price = calculateTotalPrice();

    if (!formData.user_id || selectedGames.length === 0) {
      toast.error("User ID dan Game Harus Diisi");
      return;
    }

    try {
      // Step 1: Buat Order
      const createOrderResponse = await axios.post(
        "http://localhost:5000/order/createOrder",
        { ...formData, total_price },
        { withCredentials: true }
      );

      const orderId = createOrderResponse.data.order_id;

      // Step 2: Tambahkan Game ke Order_items
      for (const game of selectedGames) {
        await axios.post(
          "http://localhost:5000/order/createOrderItems",
          {
            order_id: orderId,
            game_id: game.game_id,
            quantity: game.quantity,
            price: game.price,
          },
          { withCredentials: true }
        );
      }

      toast.success("Order Berhasil Dibuat", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      closeModal();
      fetchOrders(currentPage);
    } catch (err) {
      console.error("Error Creating Order: ", err);
      const errorMessage =
        err.response?.data?.message || "Terjadi Kesalahan Saat Membuat Order";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Menghapus Order
  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Konfirmasi Penghapusan",
      text: "Apakah anda yakin ingin menghapus order ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/order/${orderId}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast.success("Order Berhasil Dihapus");
          fetchOrders(currentPage);
        }
      } catch (error) {
        console.error("Error Deleting Order: ", error);
        toast.error(
          error.response?.data?.message || "Gagal menghapus Order."
        );
      }
    }
  };

  const formatPrice = (price) =>
    price <= 0 ? "FREE" : `Rp${Math.floor(price).toLocaleString("id-ID")}`;

  return (
    <div className="order-dashboard">
      <ToastContainer />
      <Sidebar />
      <div className="order-main-container">
        <div className="order-header">
          <h1 className="order-title">Transaction Dashboard</h1>
        </div>

        {/* Filter Section */}
        <div className="order-filters">
          <div className="dropdown-filter">
            <label htmlFor="filter-dropdown">Pilih Filter</label>
            <select
              id="filter-dropdown"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="">Pilih Filter</option>
              <option value="payment_status">Status Pembayaran</option>
              <option value="order_date">Tanggal Order</option>
              <option value="min_total_price">Harga Minimum</option>
              <option value="max_total_price">Harga Maksimum</option>
            </select>
          </div>

          {/* Filter Content */}
          {activeFilter === "payment_status" && (
            <div className="filter-content">
              <label htmlFor="payment-status-filter">Status Pembayaran:</label>
              <select
                id="payment-status-filter"
                name="payment_status"
                value={filters.payment_status}
                onChange={(e) =>
                  handleLocalFilterChange("payment_status", e.target.value)
                }
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          )}

          {activeFilter === "order_date" && (
            <div className="filter-content">
              <label htmlFor="min-price-filter">Tanggal Order:</label>
              <input
                id="order-date-filter"
                type="date"
                name="order_date"
                value={filters.order_date}
                onChange={(e) =>
                  handleLocalFilterChange("order_date", e.target.value)
                }
              />
            </div>
          )}

          {activeFilter === "min_total_price" && (
            <div className="filter-content">
              <label htmlFor="min-price-filter">Harga Minimum:</label>
              <input
                id="min-price-filter"
                type="text"
                inputMode="numeric"
                name="min_total_price"
                value={filters.min_total_price}
                onChange={(e) =>
                  handleLocalFilterChange("min_total_price", e.target.value)
                }
                placeholder="Rp"
              />
            </div>
          )}

          {activeFilter === "max_total_price" && (
            <div className="filter-content">
              <label htmlFor="max-price-filter">Harga Maksimum:</label>
              <input
                id="max-price-filter"
                type="text"
                inputMode="numeric"
                name="max_price_filter"
                value={filters.max_total_price}
                onChange={(e) =>
                  handleLocalFilterChange("max_total_price", e.target.value)
                }
                placeholder="Rp"
              />
            </div>
          )}
        </div>
        <button className="add-order-button" onClick={openModal}>
          <FaPlus />
          <span className="button-text-add-order">Create Wishlist</span>
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="order-modal-overlay">
          <div className="order-modal-content">
            <h2>Create New Order</h2>

            {/* Form */}
            <form>
              <div className="order-form-group">
                <label htmlFor="user_id">User ID</label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="order-form-group">
                <label>Games</label>
                <button
                  type="button"
                  onClick={() => setIsGameSelectionModalOpen(true)}
                  className="order-select-games-button"
                >
                  Select Games
                </button>
                <ul>
                  {selectedGames.map((game) => (
                    <li key={game.game_id}>
                      {game.title} x{game.quantity} - Rp
                      {game.price.toLocaleString("id-ID")}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-form-group">
                <label htmlFor="total_price">Total Prices</label>
                <input
                  type="number"
                  id="total_price"
                  name="total_price"
                  value={formData.total_price || 0}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>

              <div className="order-form-group">
                <label htmlFor="payment_status">Payment Status</label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </form>

            <div className="order-form-actions">
              <button
                type="submit"
                className="order-btn-submit"
                onClick={handleCreateOrder}
              >
                Submit
              </button>
              <button
                type="button"
                className="order-btn-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Game Selection */}
      {isGameSelectionModalOpen && (
        <div className="game-selection-modal-overlay">
          <div className="game-selection-modal-content">
            <h2>Select Games</h2>
            <div className="order-game-cards">
              {games.map((game) => {
                const isSelected = selectedGames.some(
                  (g) => g.game_id === game.game_id
                );
                const selectedGame = selectedGames.find(
                  (g) => g.game_id === game.game_id
                );

                return (
                  <div key={game.game_id} className="order-game-card">
                    <img
                      src={`http://localhost:5000/uploads/${game.image}`}
                      alt={game.title}
                      className="order-game-image"
                    />
                    <h3>{game.title}</h3>
                    <p>{formatPrice(game.price)}</p>

                    {/* Jika Tombol Select Sudah dipencet maka tampilkan kolom kuantitas */}
                    {isSelected ? (
                      <div className="order-game-selected">
                        <input
                          type="number"
                          min="1"
                          value={selectedGame.quantity}
                          onChange={(e) =>
                            handleQuantitChange(game.game_id, e.target.value)
                          }
                          className="order-quantity-input"
                        />
                        <button
                          type="button"
                          className="order-select-game-button selected"
                        >
                          Selected
                        </button>
                      </div>
                    ) : (
                      // Jika Game Belum dipilih tampilkan tombol select
                      <button
                        type="button"
                        onClick={() => handleGameSelection(game)}
                        className="order-select-game-button"
                      >
                        Select
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Game Buttons */}
            <div className="order-game-pagination-controls">
              <button
                disabled={gameCurrentPage === 1}
                onClick={() => handleGamePageChange(gameCurrentPage - 1)}
                className="order-game-pagination-button"
              >
                Previous
              </button>
              <span>
                Page {gameCurrentPage} of {gameTotalPage}
              </span>
              <button
                disabled={gameCurrentPage >= gameTotalPage}
                onClick={() => handleGamePageChange(gameCurrentPage + 1)}
                className="order-game-pagination-button"
              >
                Next
              </button>
            </div>
            <div className="order-game-selection-buttons">
              <button
                type="button"
                onClick={confirmSelectedGames}
                className="order-confirm-games-button"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsGameSelectionModalOpen(false)}
                className="order-cancel-games-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Table */}
      {isLoading ? (
        <p className="order-loading-indicator">Memuat Data...</p>
      ) : error ? (
        <p className="order-error-message">{error}</p>
      ) : (
        <>
          <div className="main-content-order">
            <table className="order-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th onClick={() => toggleSort("order_date")}>
                    Tanggal Order {sortOrder.order_date === "ASC" ? "↑" : "↓"}
                  </th>
                  <th onClick={() => toggleSort("total_price")}>
                    Total Harga {sortOrder.total_price === "ASC" ? "↑" : "↓"}
                  </th>
                  <th>Status Pembayaran</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>{`Rp${parseInt(order.total_price).toLocaleString(
                      "id-ID"
                    )}`}</td>
                    <td>{order.payment_status}</td>
                    <td>
                      <div className="order-action-btn">
                        <button
                          className="btn-view"
                          onClick={() => fetchOrderDetail(order.order_id)}
                        >
                          <FaEye />
                        </button>
                        <button className="btn-edit">
                          <FaEdit />
                        </button>
                        <button className="btn-delete" onClick={() => deleteOrder(order.order_id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Detail Order */}
      {isModalDetailOpen && (
        <div className="detailorder-modal-overlay">
          <div className="detailorder-model-content">
            <button
              onClick={closeDetailModal}
              className="btn-detail-close-modal"
              aria-label="Close"
            >
              &times;
            </button>
            <h2>Detail Order</h2>
            {orderDetail ? (
              <div className="order-details">
                <p>
                  <strong>Order ID:</strong> {orderDetail.order_id}
                </p>
                <p>
                  <strong>User ID:</strong> {orderDetail.user_id}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(orderDetail.order_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Price:</strong> Rp{" "}
                  {orderDetail.total_price.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Payment Status:</strong> {orderDetail.payment_status}
                </p>
                <h3>Items:</h3>
                <div className="order-items-grid">
                  {orderDetail.items.map((item) => (
                    <div key={item.order_item_id} className="order-item-card">
                      <img
                        src={
                          item.image
                            ? `http://localhost:5000/uploads/${item.image}`
                            : "default-image-url.png"
                        }
                        alt={item.game_title || "Game Image"}
                        className="item-image"
                      />
                      <div className="order-item-info">
                        <p>
                          <strong>{item.game_title || "Unknown Game"}</strong>
                        </p>
                        <p>Quantity: {item.quantity || 0}</p>
                        <p>
                          Price: Rp{" "}
                          {item.item_price
                            ? item.item_price.toLocaleString("id-ID")
                            : "0"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}

      <div className="main-content-order-2">
        <div className="order-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
          <span>
            Halaman {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
