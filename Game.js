import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DPStateDisplay, findOptimalSplit, calculateOptimalWeighings } from './DPLogic';
import './DPLogic.css';
import './Game.css';

function Game({ user }) {
  const { numCoins } = useParams();
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [fakeCoinIndex, setFakeCoinIndex] = useState(null);
  const [leftPan, setLeftPan] = useState([]);
  const [rightPan, setRightPan] = useState([]);
  const [weighingResult, setWeighingResult] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [scaleTilt, setScaleTilt] = useState('balanced');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [possibleFakeCoins, setPossibleFakeCoins] = useState([]);
  const [lastWeighing, setLastWeighing] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && !gameOver) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameOver]);

  // Game initialization effect
  useEffect(() => {
    const initializeGame = () => {
      if (!user) return;

      const totalCoins = parseInt(numCoins);
      const newCoins = Array(totalCoins).fill(10);
      const fakeIndex = Math.floor(Math.random() * totalCoins);
      newCoins[fakeIndex] = 9;
      setCoins(newCoins);
      setFakeCoinIndex(fakeIndex);
      setPossibleFakeCoins(Array.from({ length: totalCoins }, (_, i) => i));
    };

    initializeGame();
  }, [numCoins, user]);

  const handleDragStart = (e, coinIndex) => {
    e.dataTransfer.setData('coinIndex', coinIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, pan) => {
    e.preventDefault();
    const coinIndex = parseInt(e.dataTransfer.getData('coinIndex'));
    
    // Remove coin from both pans if it exists
    setLeftPan(prev => prev.filter(c => c !== coinIndex));
    setRightPan(prev => prev.filter(c => c !== coinIndex));
    
    // Add coin to the dropped pan
    if (pan === 'left') {
      setLeftPan(prev => [...prev, coinIndex]);
    } else {
      setRightPan(prev => [...prev, coinIndex]);
    }
  };

  const weighCoins = () => {
    if (leftPan.length === 0 || rightPan.length === 0) {
      setMessage('Please place coins on both sides of the scale');
      return;
    }

    if (leftPan.length !== rightPan.length) {
      setMessage('Please place equal number of coins on both sides');
      return;
    }

    const leftWeight = leftPan.reduce((sum, index) => sum + coins[index], 0);
    const rightWeight = rightPan.reduce((sum, index) => sum + coins[index], 0);

    setAttempts(prev => prev + 1);

    let result = '';
    let newPossibleFakeCoins = [...possibleFakeCoins];

    if (leftWeight < rightWeight) {
      result = 'Left side is lighter - Fake coin is on the left side';
      setScaleTilt('left');
      newPossibleFakeCoins = newPossibleFakeCoins.filter(coin => leftPan.includes(coin));
    } else if (rightWeight < leftWeight) {
      result = 'Right side is lighter - Fake coin is on the right side';
      setScaleTilt('right');
      newPossibleFakeCoins = newPossibleFakeCoins.filter(coin => rightPan.includes(coin));
    } else {
      result = 'Both sides are equal - Fake coin is not in these groups';
      setScaleTilt('balanced');
      newPossibleFakeCoins = newPossibleFakeCoins.filter(
        coin => !leftPan.includes(coin) && !rightPan.includes(coin)
      );
    }

    setWeighingResult(result);
    setPossibleFakeCoins(newPossibleFakeCoins);
    setLastWeighing({
      leftPan,
      rightPan,
      result,
      remainingCoins: newPossibleFakeCoins,
      step: attempts + 1
    });
  };

  const clearScale = () => {
    setLeftPan([]);
    setRightPan([]);
    setScaleTilt('balanced');
    setWeighingResult('');
  };

  const handleGuess = (guessIndex) => {
    if (guessIndex === fakeCoinIndex) {
      setMessage('Congratulations! You found the fake coin! 🎉');
      setGameOver(true);
      setIsTimerRunning(false);
      
      localStorage.setItem('gameResult', JSON.stringify({
        winner: user,
        attempts: attempts,
        totalCoins: numCoins,
        timeSpent: timer,
        hintsUsed: hintsUsed,
        success: true,
        date: new Date().toISOString()
      }));
      
      setTimeout(() => navigate('/result'), 2000);
    } else {
      setMessage('Wrong guess! Try again. 🤔');
      setAttempts(prev => prev + 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Fake Coin Detection Game</h1>
        <p className="game-subtitle">Find the fake coin (lighter) using the balance scale</p>
        
        <div className="game-stats">
          <div className="attempts-counter">
            <span className="attempts-label">Attempts:</span>
            <span className="attempts-value">{attempts}</span>
            <span className="optimal-steps">
              (Optimal: {calculateOptimalWeighings(parseInt(numCoins))})
            </span>
          </div>
          
          <div className="timer-display">
            <span className="timer-label">Time:</span>
            <span className="timer-value">{formatTime(timer)}</span>
          </div>
        </div>
      </div>

      <div className="coins-container">
        {coins.map((_, index) => (
          <div
            key={index}
            className={`coin ${possibleFakeCoins.includes(index) ? 'possible-fake' : 'eliminated'}`}
            draggable={!gameOver && possibleFakeCoins.includes(index)}
            onDragStart={(e) => handleDragStart(e, index)}
          >
            <div className="coin-inner">
              <span className="coin-number">{index + 1}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`scale-container ${scaleTilt}`}>
        <div className="scale-beam">
          <div 
            className="scale-group left"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'left')}
          >
            <h3>Left Scale</h3>
            <div className="selected-coins">
              {leftPan.map(index => (
                <div key={index} className="scale-coin">
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div 
            className="scale-group right"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'right')}
          >
            <h3>Right Scale</h3>
            <div className="selected-coins">
              {rightPan.map(index => (
                <div key={index} className="scale-coin">
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="controls">
          <button
            onClick={weighCoins}
            className="weigh-button"
            disabled={gameOver}
          >
            <span className="button-icon">⚖️</span>
            Weigh Coins
          </button>
          <button
            onClick={clearScale}
            className="clear-button"
            disabled={gameOver}
          >
            <span className="button-icon">🔄</span>
            Clear Scale
          </button>
        </div>
      </div>

      {weighingResult && (
        <div className="result-message">
          <p>{weighingResult}</p>
        </div>
      )}

      {message && (
        <div className={`message ${gameOver ? 'success' : ''}`}>
          {message}
        </div>
      )}

      <div className="guess-section">
        <h3>Make your guess</h3>
        <div className="guess-coins">
          {possibleFakeCoins.map(index => (
            <button
              key={index}
              className="guess-button"
              onClick={() => handleGuess(index)}
              disabled={gameOver}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Game;