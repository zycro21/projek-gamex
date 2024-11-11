import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Impor useNavigate dari react-router-dom
import "../styles/Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Inisialisasi useNavigate untuk navigasi

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/admin/admins/register",
        {
          email,
          username,
          password,
        }
      );
      setMessage(response.data.message); // Menampilkan notifikasi berhasil
      setTimeout(() => {
        navigate("/login"); // Alihkan ke halaman login setelah 2 detik
      }, 2000); // Tunggu 2 detik sebelum mengalihkan
    } catch (error) {
      // Cek apakah error memiliki respons dan apakah ada errors
      if (error.response && error.response.data.errors) {
        setMessage(error.response.data.errors[0].msg); // Menampilkan pesan error pertama
      } else {
        setMessage("Error occurred"); // Pesan error umum
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register Admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Sudah memiliki akun? <Link to="/login">Login di sini</Link>
      </p>
    </div>
  );
};

export default Register;
