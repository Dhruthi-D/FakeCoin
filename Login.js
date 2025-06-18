import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedUsers = JSON.parse(localStorage.getItem("users")) || {};

    if (storedUsers[username]) {
      // Username exists, check password
      if (storedUsers[username] !== password) {
        setError("Incorrect password!");
        return;
      }
    } else {
      // New user — store credentials
      storedUsers[username] = password;
      localStorage.setItem("users", JSON.stringify(storedUsers));
    }

    localStorage.setItem("currentUser", username);
    setUser(username); // You can pass this to App.js state if needed
    navigate("/home"); // Or wherever the game starts
  };

  return (
    <div className="login-container">
      <h2>Login to Play</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default Login;