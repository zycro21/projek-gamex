import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/admin/admins/login",
        {
          email,
          password,
        }
      );
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response.data.message || "Error occurred");
    }
  };

  return (
    <div className="login-container">
      <h2>Login Admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="container-forgotpass">
          <p className="forgotPassword">
            Lupa password?&nbsp;&nbsp;
            <Link to="/forgot-password">Klik di sini</Link>
          </p>
        </div>
        <div className="container-login">
          <button type="submit">Login</button>
        </div>
      </form>
      {message && <p>{message}</p>}
      <p>
        Belum memiliki akun? <Link to="/register">Daftar di sini</Link>
      </p>
    </div>
  );
};

export default Login;
