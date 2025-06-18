import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Game from "./Game";
import Result from "./Result";
import Login from "./Login";
import Leaderboard from "./Leaderboard";
import Analysis from "./Analysis";

function App() {
  const [user, setUser] = useState(localStorage.getItem("currentUser"));
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/game/:numCoins" element={<Game user={user} />} />
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;
