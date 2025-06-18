import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const gameResult = JSON.parse(localStorage.getItem('gameResult'));
    if (gameResult) {
      setResult(gameResult);
      calculateAchievements(gameResult);
      
      // Only update leaderboard once
      if (!updated) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        
        // Create new entry with additional stats
        const newEntry = {
          player: gameResult.winner,
          attempts: parseInt(gameResult.attempts),
          totalCoins: parseInt(gameResult.totalCoins),
          timeSpent: gameResult.timeSpent,
          hintsUsed: gameResult.hintsUsed,
          difficulty: gameResult.difficulty,
          date: new Date().toISOString()
        };

        // Check if this exact result is already in the leaderboard
        const isDuplicate = leaderboard.some(entry => 
          entry.player === newEntry.player && 
          entry.attempts === newEntry.attempts &&
          entry.totalCoins === newEntry.totalCoins &&
          Math.abs(new Date(entry.date) - new Date()) < 1000 // within 1 second
        );

        if (!isDuplicate) {
          leaderboard.push(newEntry);
          localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        }
        setUpdated(true);
      }
    }
  }, [updated]);

  const calculateAchievements = (result) => {
    const achievements = [];
    const optimalAttempts = Math.ceil(Math.log2(result.totalCoins));
    
    // Perfect solve achievement
    if (result.attempts <= optimalAttempts) {
      achievements.push({
        title: "Perfect Solver! 🏆",
        description: "Solved in the minimum possible attempts!",
        icon: "🎯"
      });
    }
    
    // Speed demon achievement
    if (result.timeSpent < optimalAttempts * 30) {
      achievements.push({
        title: "Speed Demon! ⚡",
        description: "Solved with incredible speed!",
        icon: "⚡"
      });
    }
    
    // No hints achievement
    if (result.hintsUsed === 0) {
      achievements.push({
        title: "Pure Logic! 🧠",
        description: "Solved without using any hints!",
        icon: "🧠"
      });
    }
    
    // First win achievement
    const previousGames = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    if (previousGames.length === 0) {
      achievements.push({
        title: "First Victory! 🎉",
        description: "Completed your first game!",
        icon: "🎉"
      });
    }
    
    setAchievements(achievements);
  };

  // Calculate performance rating
  const getPerformanceRating = () => {
    if (!result) return null;
    const coins = parseInt(result.totalCoins);
    const attempts = parseInt(result.attempts);
    const optimalAttempts = Math.ceil(Math.log2(coins));
    
    if (attempts <= optimalAttempts) return 'Perfect! 🏆';
    if (attempts <= optimalAttempts + 1) return 'Excellent! 🌟';
    if (attempts <= optimalAttempts + 2) return 'Great! 👏';
    return 'Good Job! 👍';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <div className="result-container">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(80)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`
            }} />
          ))}
        </div>
      )}
      {result && (
        <div className="result-card">
          <div className="result-header">
            <h1>Game Complete!</h1>
            <div className="performance-badge">
              {getPerformanceRating()}
            </div>
          </div>

          <div className="result-details">
            <div className="winner-section">
              <h2>Congratulations {result.winner}!</h2>
              <p className="subtitle">You've mastered the art of coin detection!</p>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Attempts</span>
                <span className="stat-value">{result.attempts}</span>
                <span className="stat-optimal">Optimal: {Math.ceil(Math.log2(result.totalCoins))}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(result.timeSpent)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Coins</span>
                <span className="stat-value">{result.totalCoins}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Hints Used</span>
                <span className="stat-value">{result.hintsUsed}</span>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="achievements-section">
                <h3>Achievements Unlocked!</h3>
                <div className="achievements-row">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="achievement-card">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="achievement-section">
              <p className="achievement-text">
                You solved this puzzle with {result.totalCoins} coins in {result.attempts} attempts
                and {formatTime(result.timeSpent)}!
              </p>
            </div>
          </div>

          <div className="result-actions">
            <button className="action-button play-again" onClick={() => navigate('/home')}>
              <span className="button-icon">🎮</span>
              Play Again
            </button>
            <button className="action-button view-leaderboard" onClick={() => navigate('/leaderboard')}>
              <span className="button-icon">🏆</span>
              View Leaderboard
            </button>
            <button className="action-button logout-button" onClick={handleLogout}>
              <span className="button-icon">🚪</span>
              Logout
            </button>
            <button className="action-button share-result" onClick={() => {
              const text = `I solved the Fake Coin Detection puzzle with ${result.totalCoins} coins in ${result.attempts} attempts! Can you beat my score?`;
              if (navigator.share) {
                navigator.share({
                  title: 'Fake Coin Detection Game',
                  text: text,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text).then(() => {
                  alert('Result copied to clipboard!');
                });
              }
            }}>
              <span className="button-icon">📤</span>
              Share Result
            </button>
            <button className="action-button analysis-button" onClick={() => navigate('/analysis')}>
              <span className="button-icon">🧩</span>
              View Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;
