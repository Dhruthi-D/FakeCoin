import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [customCoins, setCustomCoins] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
    } else {
      setUsername(currentUser);
    }
  }, [navigate]);

  const startGame = (numCoins) => {
    navigate(`/game/${numCoins}`);
  };

  const handleCustomInput = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setCustomCoins(value);
    }
  };

  const handleCustomStart = () => {
    const num = parseInt(customCoins);
    if (!isNaN(num) && num >= 3 && num <= 32) {
      startGame(num);
    } else {
      alert("Please enter a number between 3 and 32.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <div className="home-container">
      <h1>🪙 The Fake Coin Challenge</h1>
      {username && (
        <div className="user-info">
          <p>Welcome, <strong>{username}</strong>!</p>
          
        </div>
      )}

      <p>Select the number of coins to play with:</p>

      <div className="card-container">
        {[3, 8, 12, 24].map((num) => (
          <div key={num} className="coin-card" onClick={() => startGame(num)}>
            <h2>{num}</h2>
            <p>coins</p>
          </div>
        ))}
      </div>

      <div className="custom-input">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter custom coin count (3-32)"
          value={customCoins}
          onChange={handleCustomInput}
          style={{ width: '200px', padding: '10px', fontSize: '16px' }}
        />
        <button onClick={handleCustomStart}>Start</button>
      </div>

      <Link to="/leaderboard" className="learn-more-button">Leaderboard</Link>
      <br></br>
      <Link to="/learn" className="learn-more-button">Learn More</Link>
      <br></br>
      <button className="logout-button" onClick={handleLogout}>🚪 Logout</button>
      <footer>
        <p>Test your logic and beat the scale! ⚖️</p>
      </footer>
    </div>
  );
}

export default Home;