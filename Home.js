import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const [numCoins, setNumCoins] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleStartGame = () => {
        const coins = parseInt(numCoins);
        if (coins >= 3 && coins <= 32) {
            // Navigate to game route with numCoins as URL parameter
            navigate(`/game/${coins}`);
        }
    };

    const handleViewLeaderboard = () => {
        navigate('/leaderboard');
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Only allow empty string or positive integers (no decimals)
        if (value === '' || /^\d+$/.test(value)) {
            setNumCoins(value);
            setError('');
        } else if (/\./.test(value)) {
            setError('Please enter a whole number (no decimals)');
        }
    };

    return (
        <div className="home-bg-animated">
            <div className="home-container">
                <div className="home-card">
                    <h1 className="home-title">🪙 <span>Fake Coin Detection</span></h1>
                    <h2 className="home-subtitle">Ready to find the fake coin?</h2>
                    <input
                        type="number"
                        className="coin-input"
                        placeholder="Enter number of coins (3-32)"
                        value={numCoins}
                        onChange={handleInputChange}
                        min="3"
                        max="32"
                        step="1"
                    />
                    {error && <div className="home-error">{error}</div>}
                    <div className="button-group">
                        <button 
                            className="home-button"
                            onClick={handleStartGame}
                            disabled={!numCoins || parseInt(numCoins) < 3 || parseInt(numCoins) > 32}
                        >
                            <span role="img" aria-label="play">🎮</span> Start Game
                        </button>
                        <button 
                            className="home-button secondary"
                            onClick={handleViewLeaderboard}
                        >
                            <span role="img" aria-label="leaderboard">🏆</span> View Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home; 