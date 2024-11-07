import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./sidebar";
import "../styles/UserDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);

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
      toast.error("Error fetching users");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh the user list
      toast.success("User deleted successfully");
      setIsDeletePopupOpen(false); // Close delete popup
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { user_id, email, username } = selectedUser;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/admin/users/${user_id}`,
        { email, username },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      toast.success("User updated successfully");
      setIsUpdatePopupOpen(false); // Close update popup
      setSelectedUser({});
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        <table className="user-table">
          <thead>
            <tr>
              <th>ID User</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className="role-column">
                  <div className={`role-badge ${user.role}`}>{user.role}</div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsUpdatePopupOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => {
                        setUserToDelete(user);
                        setIsDeletePopupOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Update User Pop-up */}
        {isUpdatePopupOpen && selectedUser.user_id && (
          <div className="popup">
            <div className="popup-content">
              <h4 className="tulisanpopup">Update Profil</h4>
              <form onSubmit={handleUpdate}>
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
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  }
                  required
                />
                <button type="submit" className="update-button">
                  Confirm
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsUpdatePopupOpen(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Pop-up */}
        {isDeletePopupOpen && userToDelete && (
          <div className="popup">
            <div className="popup-content">
              <h4 className="tulisanpopup">
                Are you sure you want to delete this user?
              </h4>
              <button
                className="confirm-button"
                onClick={() => handleDelete(userToDelete.user_id)}
              >
                Confirm
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsDeletePopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDashboard;
