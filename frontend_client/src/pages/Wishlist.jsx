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
  const [wishlists, setWishlists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Create New Wishlist
  const CreateWishlist = (e) => {
    e.preventDefault();



  }

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

  return (
    <div className="wishlist-dashboard">
      <ToastContainer />
      <Sidebar />
      <div className="wishlist-main-container">
        <h1 className="wishlist-title">WISHLIST DASHBOARD</h1>
          <button className="add-wishlist-button">
            <FaPlus />
            <span className="button-text-add-wishlist">Create Wishlist</span>
          </button>
      </div>

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
                        <button className="wishlist-edit-button">
                          <FaEdit />
                        </button>
                        <button className="wishlist-delete-button">
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

export default WishlistDashboard;
