import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Leaderboard() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Sort by score descending
    const sorted = leaderboard.sort((a, b) => b.score - a.score);

    setData(sorted);
  }, []);

  return (
    <div className="container">
      <h1>🏆 Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Best Score</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="3">No entries yet!</td>
            </tr>
          ) : (
            data.map((user, index) => (
              <tr key={user.username}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button
        style={{ marginTop: "20px", backgroundColor: "green", color: "white", padding: "10px 20px", borderRadius: "6px" }}
        onClick={() => navigate("/home")}
      >
        🔙 Back to Home
      </button>
    </div>
  );
}

export default Leaderboard;