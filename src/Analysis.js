import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { findOptimalSplit } from './DPLogic';

function getNodeLabel(step, weighing, fakeCoinIndex, numCoins, isFinal, finalGuess, outcome) {
  if (isFinal) {
    return (
      <span>
        <b>Final Guess:</b> Coin {finalGuess + 1} {finalGuess === fakeCoinIndex ? '🪙' : ''}
      </span>
    );
  }
  if (!weighing) {
    // Start node
    const startCoins = Array.from({ length: numCoins }, (_, i) =>
      i === fakeCoinIndex
        ? <span key={i} style={{ color: 'red', fontWeight: 700 }}>{i + 1}</span>
        : i + 1
    );
    // Add commas between numbers
    const startCoinsWithCommas = startCoins.map((el, idx) =>
      idx < startCoins.length - 1 ? [el, ', '] : el
    );
    return (
      <span>
        <b>Start</b> <br />
        Coins: {startCoinsWithCommas}
      </span>
    );
  }
  const nextCoins = getNextCoins(weighing, outcome);
  // Build an array of elements, with the fake coin in red
  const remainingElements = nextCoins.map((i, idx) => {
    const isFake = i === fakeCoinIndex;
    const el = isFake ? <span key={i} style={{ color: 'red', fontWeight: 700 }}>{i + 1}</span> : (i + 1);
    // Add comma except after last element
    return idx < nextCoins.length - 1 ? [el, ', '] : el;
  });
  return (
    <span>
      <b>Step {step}</b><br />
      <span style={{ fontSize: '0.95em' }}>
        <b>Left:</b> {weighing.leftPan.map(i => i + 1).join(', ') || '-'}<br />
        <b>Right:</b> {weighing.rightPan.map(i => i + 1).join(', ') || '-'}<br />
        <b>Result:</b> {outcome || weighing.result}
      </span><br />
      <span style={{ color: '#1565c0', fontWeight: 600 }}>
        Remaining: {remainingElements}
        {nextCoins.includes(fakeCoinIndex) ? ' 🪙' : ''}
      </span>
    </span>
  );
}

function getNextCoins(weighing, outcome) {
  if (!weighing) return [];
  if (outcome === 'Left side is lighter - Fake coin is on the left side') {
    return weighing.leftPan;
  } else if (outcome === 'Right side is lighter - Fake coin is on the right side') {
    return weighing.rightPan;
  } else if (outcome === 'Both sides are equal - Fake coin is not in these groups') {
    return weighing.remainingCoins.filter(
      coin => !weighing.leftPan.includes(coin) && !weighing.rightPan.includes(coin)
    );
  }
  return weighing.remainingCoins;
}

const OUTCOMES = [
  'Left side is lighter - Fake coin is on the left side',
  'Right side is lighter - Fake coin is on the right side',
  'Both sides are equal - Fake coin is not in these groups'
];

// Simulate the optimal move history for a given fake coin and numCoins
function simulateOptimalHistory(numCoins, fakeCoinIndex) {
  let possibleFakeCoins = Array.from({ length: numCoins }, (_, i) => i);
  const moves = [];
  let step = 0;
  while (possibleFakeCoins.length > 1) {
    const groupSize = Math.floor(possibleFakeCoins.length / 2);
    const leftPan = possibleFakeCoins.slice(0, groupSize);
    const rightPan = possibleFakeCoins.slice(groupSize, 2 * groupSize);
    const leftovers = possibleFakeCoins.slice(2 * groupSize);
    let result = '';
    let newPossibleFakeCoins = [];
    if (leftPan.includes(fakeCoinIndex)) {
      result = 'Left side is lighter - Fake coin is on the left side';
      newPossibleFakeCoins = leftPan;
    } else if (rightPan.includes(fakeCoinIndex)) {
      result = 'Right side is lighter - Fake coin is on the right side';
      newPossibleFakeCoins = rightPan;
    } else {
      result = 'Both sides are equal - Fake coin is not in these groups';
      newPossibleFakeCoins = leftovers;
    }
    moves.push({
      leftPan,
      rightPan,
      leftovers,
      result,
      remainingCoins: newPossibleFakeCoins,
      step: ++step
    });
    possibleFakeCoins = newPossibleFakeCoins;
  }
  return {
    moves,
    fakeCoinIndex,
    numCoins,
    finalGuess: fakeCoinIndex
  };
}

function Analysis() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [fakeCoinIndex, setFakeCoinIndex] = useState(null);
  const [numCoins, setNumCoins] = useState(0);
  const [zoomEnabled, setZoomEnabled] = useState(false);

  useEffect(() => {
    const moveHistory = JSON.parse(localStorage.getItem('moveHistory') || '{}');
    const { moves = [], fakeCoinIndex: initialFakeCoinIndex, numCoins: initialNumCoins, finalGuess } = moveHistory;
    if (!initialNumCoins) return;
    setNumCoins(initialNumCoins);
    setFakeCoinIndex(initialFakeCoinIndex);
  }, []);

  useEffect(() => {
    if (!numCoins || fakeCoinIndex === null) return;
    // Simulate the optimal history for the selected fake coin
    const moveHistory = simulateOptimalHistory(numCoins, fakeCoinIndex);
    const { moves, finalGuess } = moveHistory;
    let builtNodes = [];
    let builtEdges = [];
    let nodeId = 0;
    function addNode(step, weighing, parentId, x, y, isUserPath, outcome, isFinal, finalGuessIdx) {
      nodeId++;
      const id = `n${nodeId}`;
      let highlight = false;
      let coins = weighing ? getNextCoins(weighing, outcome) : Array.from({ length: numCoins }, (_, i) => i);
      if (typeof finalGuessIdx === 'number') coins = [finalGuessIdx];
      if (coins.includes(fakeCoinIndex)) highlight = true;
      builtNodes.push({
        id,
        data: { label: getNodeLabel(step, weighing, fakeCoinIndex, numCoins, isFinal, finalGuessIdx, outcome) },
        position: { x, y },
        style: {
          border: highlight ? '3px solid gold' : isUserPath ? '3px solid #2196f3' : '2px solid #b3c6e7',
          background: highlight ? '#fffde7' : isUserPath ? '#e3f2fd' : '#f0f4f8',
          color: '#1565c0',
          fontWeight: isUserPath ? 700 : 400,
          opacity: isUserPath ? 1 : 0.5,
          minWidth: 240
        }
      });
      if (parentId) {
        builtEdges.push({
          id: `e${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: isUserPath,
          style: { stroke: highlight ? 'gold' : isUserPath ? '#2196f3' : '#b3c6e7', strokeWidth: highlight ? 3 : isUserPath ? 2.5 : 1.5, opacity: isUserPath ? 1 : 0.5, strokeDasharray: isUserPath ? '0' : '6 4' }
        });
      }
      return id;
    }
    function buildTree(step, parentId, x, y) {
      if (step >= moves.length) {
        if (typeof finalGuess === 'number') {
          addNode(step + 1, null, parentId, x, y + 200, true, null, true, finalGuess);
        }
        return;
      }
      const weighing = moves[step];
      const outcomesToShow = [OUTCOMES[0], OUTCOMES[1]];
      const leftovers = weighing.remainingCoins.filter(
        coin => !weighing.leftPan.includes(coin) && !weighing.rightPan.includes(coin)
      );
      if (leftovers.length > 0) outcomesToShow.push(OUTCOMES[2]);
      outcomesToShow.forEach((outcome, i) => {
        // Only the actual path is expanded
        const isUserPath = weighing.result === outcome;
        const branchX = x + (i - (outcomesToShow.length - 1) / 2) * 340;
        const branchY = y + 200;
        const childId = addNode(step + 1, weighing, parentId, branchX, branchY, isUserPath, outcome, false, null);
        if (isUserPath && (outcome === OUTCOMES[0] || outcome === OUTCOMES[1] || outcome === OUTCOMES[2])) {
          buildTree(step + 1, childId, branchX, branchY);
        }
      });
    }
    const startId = addNode(0, null, null, 0, 0, true, null, false, null);
    buildTree(0, startId, 0, 0);
    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [fakeCoinIndex, numCoins]);

  return (
    <div className="analysis-container">
      <button className="action-button" style={{ marginBottom: 24 }} onClick={() => navigate('/result')}>
        ← Back to Results
      </button>
      <h1>Game Analysis</h1>
      {numCoins > 0 && (
        <div className="analysis-toolbar">
          <label htmlFor="fake-coin-select" style={{ fontWeight: 600, color: '#1565c0', marginRight: 8 }}>Select Fake Coin:</label>
          <select
            id="fake-coin-select"
            value={fakeCoinIndex !== null ? fakeCoinIndex : ''}
            onChange={e => setFakeCoinIndex(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #2196f3', fontWeight: 600 }}
          >
            {Array.from({ length: numCoins }, (_, i) => (
              <option key={i} value={i}>{i + 1}</option>
            ))}
          </select>
          <button
            style={{
              marginLeft: 16,
              padding: '6px 16px',
              borderRadius: 8,
              border: '1.5px solid #2196f3',
              background: zoomEnabled ? '#2196f3' : '#e3f2fd',
              color: zoomEnabled ? 'white' : '#1565c0',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onClick={() => setZoomEnabled(z => !z)}
            title={zoomEnabled ? 'Disable zoom/pan' : 'Enable zoom/pan'}
          >
            {zoomEnabled ? '🖱️ Zoom/Pan: ON' : '🖱️ Zoom/Pan: OFF'}
          </button>
        </div>
      )}
      <p>Below is a binary state space tree of your moves. The path you took is highlighted in blue. The fake coin is highlighted in gold in each state. A third branch appears only if there are leftover coins. Only the lighter side is expanded at each step.</p>
      <div style={{ height: '80vh', width: '100%', background: '#e3f2fd', borderRadius: 12, marginTop: 24 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          panOnDrag={zoomEnabled}
          zoomOnScroll={zoomEnabled}
          zoomOnPinch={zoomEnabled}
          panOnScroll={false}
        >
          <Controls />
          <Background color="#b3c6e7" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default Analysis; 