import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [difficulty, setDifficulty] = useState('normal');
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dpHistory, setDpHistory] = useState([]);
  const [showDpAnalysis, setShowDpAnalysis] = useState(false);
  const [hintText, setHintText] = useState('');

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
      
      // Initialize possible fake coins
      setPossibleFakeCoins(Array.from({ length: totalCoins }, (_, i) => i));
      
      // Check if it's the first time playing
      const hasPlayed = localStorage.getItem('hasPlayed');
      if (!hasPlayed) {
        setShowTutorial(true);
        localStorage.setItem('hasPlayed', 'true');
      } else {
        setShowTutorial(false);
      }
    };

    initializeGame();
  }, [numCoins, user]);

  // Sound effect function
  const playSound = (type) => {
    if (!soundEnabled) return;
    const sounds = {
      coin: new Audio('/sounds/coin-click.mp3'),
      weigh: new Audio('/sounds/scale-weigh.mp3'),
      success: new Audio('/sounds/success.mp3'),
      hint: new Audio('/sounds/hint.mp3')
    };
    sounds[type]?.play().catch(() => {});
  };

  const handleHint = () => {
    if (hintsUsed >= 3) {
      setHintText('You have used all available hints!');
      setShowHint(true);
      return;
    }

    if (possibleFakeCoins.length <= 1) {
      setHintText('No hints available - you are very close!');
      setShowHint(true);
      return;
    }

    const optimalSplit = findOptimalSplit(possibleFakeCoins);
    const leftCount = optimalSplit.split.length;
    const rightCount = optimalSplit.right ? optimalSplit.right.length : (possibleFakeCoins.length - leftCount);
    const aside = optimalSplit.leftovers || possibleFakeCoins.filter(c => !optimalSplit.split.includes(c) && !(optimalSplit.right || []).includes(c));
    if (leftCount === 0 || rightCount === 0) {
      setHintText('No hints available - you are very close!');
      setShowHint(true);
      return;
    }
    let hint = `Hint: Split the remaining coins into two groups of ${leftCount} on each pan.`;
    if (aside.length > 0) {
      hint += ` Leave aside: ${aside.map(c => c + 1).join(', ')}.`;
    }
    setHintText(hint);
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

    // Store weighing history for DP analysis
    const weighingState = {
      leftPan,
      rightPan,
      result,
      remainingCoins: newPossibleFakeCoins,
      step: attempts + 1
    };
    setDpHistory(prev => {
      const updated = [...prev, weighingState];
      localStorage.setItem('moveHistory', JSON.stringify({
        moves: updated,
        fakeCoinIndex,
        numCoins: coins.length
      }));
      return updated;
    });
    setWeighingResult(result);
    setPossibleFakeCoins(newPossibleFakeCoins);
    setLastWeighing(weighingState);
  };

  const clearScale = () => {
    setLeftPan([]);
    setRightPan([]);
    setScaleTilt('balanced');
    setWeighingResult('');
  };

  const handleGuess = (guessIndex) => {
    if (guessIndex === fakeCoinIndex) {
      playSound('success');
      setMessage('Congratulations! You found the fake coin! 🎉');
      setGameOver(true);
      setIsTimerRunning(false);
      // Save game result with additional stats
      localStorage.setItem('gameResult', JSON.stringify({
        winner: user,
        attempts: attempts,
        totalCoins: numCoins,
        timeSpent: timer,
        hintsUsed: hintsUsed,
        difficulty: difficulty,
        success: true,
        date: new Date().toISOString()
      }));
      // Save move history with final guess
      const moveHistory = JSON.parse(localStorage.getItem('moveHistory') || '{}');
      moveHistory.finalGuess = guessIndex;
      moveHistory.fakeCoinIndex = fakeCoinIndex;
      moveHistory.numCoins = coins.length;
      localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
      setTimeout(() => navigate('/result'), 2000);
    } else {
      setMessage('Wrong guess! Try again. 🤔');
      setAttempts(prev => prev + 1);
    }
  };

  const tutorialSteps = [
    "Welcome to the Fake Coin Detection Game! Let's learn how to play.",
    "One coin is lighter than the others. Use the scale to find it!",
    "Select coins and add them to the scale by clicking.",
    "Compare equal numbers of coins on each side.",
    "Use the weighing results to narrow down your search.",
    "Make your final guess when you're confident!",
  ];

  // Add function to toggle DP analysis visibility
  const toggleDpAnalysis = () => {
    setShowDpAnalysis(!showDpAnalysis);
  };

  // Early return if no user
  if (!user) {
    return null;
  }

  return (
    <div className="game-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Tutorial</h2>
            <p>{tutorialSteps[tutorialStep]}</p>
            <button 
              onClick={() => {
                if (tutorialStep < tutorialSteps.length - 1) {
                  setTutorialStep(prev => prev + 1);
                } else {
                  setShowTutorial(false);
                }
              }}
            >
              {tutorialStep < tutorialSteps.length - 1 ? 'Next' : 'Start Game'}
            </button>
          </div>
        </div>
      )}

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

          <div className="controls">
            <button 
              className={`dp-toggle ${showDpAnalysis ? 'active' : ''}`}
              onClick={toggleDpAnalysis}
            >
              {showDpAnalysis ? '🧮 Hide DP Analysis' : '🧮 Show DP Analysis'}
            </button>
            <button 
              onClick={handleHint}
              className="hint-button"
              disabled={gameOver || hintsUsed >= 3}
            >
              <span className="button-icon">💡</span>
              Hint ({3 - hintsUsed} left)
            </button>
            <button 
              className="sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {showHint && (
        <>
          <div className="hint-overlay" onClick={() => setShowHint(false)} />
          <div className="hint-popup">
            <div className="hint-content">
              <p>{hintText}</p>
              <button onClick={() => setShowHint(false)}>Got it!</button>
            </div>
          </div>
        </>
      )}
      
      {showDpAnalysis && (
        <DPStateDisplay
          coins={coins}
          possibleFakeCoins={possibleFakeCoins}
          lastWeighing={lastWeighing}
        />
      )}

      <div className="coins-container">
        {coins.map((_, index) => (
          <div
            key={index}
            className="coin"
            draggable={!gameOver}
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
          {dpHistory.length > 0 && (
            <div className="dp-history-summary">
              <p>Steps taken: {dpHistory.length}</p>
              <p>Coins eliminated: {coins.length - possibleFakeCoins.length}</p>
              <p>Information gained: {Math.log2(coins.length / possibleFakeCoins.length).toFixed(2)} bits</p>
            </div>
          )}
        </div>
      )}

      <div className="final-guess-section">
        <h2>Make your final guess</h2>
        <div className="guess-cards-row">
          {coins.map((_, index) => (
            <button
              key={index}
              className="guess-card"
              onClick={() => handleGuess(index)}
              disabled={gameOver}
            >
              <span className="guess-card-emoji">🪙</span>
              <span className="guess-card-label">Coin {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`message ${gameOver ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Game;
