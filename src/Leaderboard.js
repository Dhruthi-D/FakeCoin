import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCoins, setSelectedCoins] = useState('all');
  const [uniqueCoinCounts, setUniqueCoinCounts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('currentUser');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const data = JSON.parse(localStorage.getItem('leaderboard') || '[]');

    // Filter out invalid entries
    const validData = data.filter(entry =>
      entry &&
      entry.player &&
      typeof entry.attempts === 'number' &&
      typeof entry.totalCoins !== 'undefined' &&
      entry.date && !isNaN(new Date(entry.date).getTime())
    );

    // Get unique coin counts and ensure they are numbers
    const counts = [...new Set(validData.map(entry => parseInt(entry.totalCoins)))].sort((a, b) => a - b);
    setUniqueCoinCounts(counts);
    
    // Sort by attempts (ascending) and then by date (descending)
    const sortedData = validData.sort((a, b) => {
      if (a.attempts !== b.attempts) {
        return a.attempts - b.attempts;
      }
      return new Date(b.date) - new Date(a.date);
    });
    
    setLeaderboard(sortedData);
  };

  const clearLeaderboard = () => {
    if (!isAdmin) {
      alert('Only admin can clear the leaderboard');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to clear the entire leaderboard history?');
    if (confirmed) {
      localStorage.setItem('leaderboard', JSON.stringify([]));
      loadLeaderboard();
    }
  };

  const getFilteredLeaderboard = () => {
    if (selectedCoins === 'all') {
      return leaderboard;
    }
    return leaderboard.filter(entry => parseInt(entry.totalCoins) === parseInt(selectedCoins));
  };

  // Get only the fastest attempt per user per coin count
  const getFastestLeaderboard = (entries) => {
    const map = new Map();
    entries.forEach(entry => {
      const key = `${entry.player}__${entry.totalCoins}`;
      if (!map.has(key)) {
        map.set(key, entry);
      } else {
        const prev = map.get(key);
        // Prefer lower time, then lower attempts, then most recent
        if (
          (entry.timeSpent < prev.timeSpent) ||
          (entry.timeSpent === prev.timeSpent && entry.attempts < prev.attempts) ||
          (entry.timeSpent === prev.timeSpent && entry.attempts === prev.attempts && new Date(entry.date) > new Date(prev.date))
        ) {
          map.set(key, entry);
        }
      }
    });
    return Array.from(map.values());
  };

  const renderLeaderboardSection = (entries) => {
    if (entries.length === 0) {
      return <p className="no-entries">No entries found</p>;
    }

    // Helper to format seconds as mm:ss
    const formatTime = (seconds) => {
      if (!seconds && seconds !== 0) return '-';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return entries.map((entry, index) => (
      <div 
        key={index} 
        className={`leaderboard-entry ${entry.player === currentUser ? 'current-user' : ''}`}
      >
        <div className="entry-header">
          <span className="rank">#{index + 1}</span>
          <span className="player-name">
            {entry.player} {entry.player === currentUser ? '(You)' : ''}
          </span>
        </div>
        <div className="entry-details">
          <p>Attempts: <span className="highlight">{entry.attempts}</span></p>
          <p>Coins: <span className="highlight">{entry.totalCoins}</span></p>
          <p>Time: <span className="highlight">{formatTime(entry.timeSpent)}</span></p>
          <p>Date: {new Date(entry.date).toLocaleDateString()}</p>
        </div>
      </div>
    ));
  };

  // Main entries to show
  const filtered = getFilteredLeaderboard();
  const fastest = getFastestLeaderboard(filtered);
  const entriesToShow = showAll ? filtered : fastest;

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      
      <div className="filter-section">
        <label>Filter by number of coins:</label>
        <select 
          value={selectedCoins} 
          onChange={(e) => setSelectedCoins(e.target.value)}
          className="coin-filter"
        >
          <option value="all">All Coins</option>
          {uniqueCoinCounts.map(count => (
            <option key={count} value={count}>{count} Coins</option>
          ))}
        </select>
      </div>

      <div style={{textAlign: 'center', margin: '1.2rem 0'}}>
        <button className="show-all-btn" onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Show Fastest Only' : 'Show All Attempts'}
        </button>
      </div>

      <div className="leaderboard-list">
        {renderLeaderboardSection(entriesToShow)}
      </div>

      <div className="nav-buttons">
        <button onClick={() => navigate('/home')}>Back to Home</button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
        {isAdmin && currentUser.toLowerCase() === 'ganashree' && (
          <button 
            onClick={clearLeaderboard}
            className="clear-button"
          >
            Clear Leaderboard History
          </button>
        )}
      </div>
    </div>
  );
}

export default Leaderboard; 