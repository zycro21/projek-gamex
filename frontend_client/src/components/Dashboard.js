import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate dari react-router-dom
import axios from "axios";
import Sidebar from "./sidebar"; // Import Sidebar
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate(); // Inisialisasi navigate
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error); // Tambahkan ini untuk logging
      setMessage("Error fetching users");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh the user list
      setMessage("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error); // Tambahkan ini untuk logging
      setMessage("Error deleting user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { user_id, email, username } = selectedUser;
    console.log("Updating user with ID:", user_id); // Logging userId
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/admin/users/${user_id}`,
        { email, username },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Update response:", response.data); // Logging response
      fetchUsers(); // Refresh the user list
      setMessage("User updated successfully");
      setSelectedUser({});
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response ? error.response.data : error.message
      );
      setMessage("Error updating user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Hapus token dari localStorage
    navigate("/login"); // Arahkan ke halaman login
  };

  return (
    <div className="dashboard-container">
      <Sidebar /> {/* Menambahkan Sidebar di sini */}
      <div className="main-content">
        <h2>Dashboard</h2>
        {message && <p className="message">{message}</p>}
        <h3>Users List</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    Delete
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => setSelectedUser(user)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedUser.user_id && (
          <form onSubmit={handleUpdate} className="edit-form">
            <h4>Edit User</h4>
            <input
              type="email"
              placeholder="Email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={selectedUser.username}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, username: e.target.value })
              }
              required
            />
            <button type="submit" className="update-button">
              Update User
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
