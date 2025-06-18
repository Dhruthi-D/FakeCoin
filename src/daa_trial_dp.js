import React from 'react';

// DP table to store optimal moves for each state
const dpTable = new Map();

// Function to generate explanation for the current state
const generateExplanation = (possibleFakeCoins, optimalSplit) => {
  if (possibleFakeCoins.length <= 1) {
    return "You can now make your final guess!";
  }

  const leftCoins = optimalSplit.split.map(i => possibleFakeCoins[i]);
  const rightCoins = possibleFakeCoins.filter((_, i) => !optimalSplit.split.includes(i));
  
  if (possibleFakeCoins.length === 2) {
    return `Compare coins ${leftCoins[0] + 1} and ${rightCoins[0] + 1} to determine which one is fake.`;
  }

  return `Based on DP analysis, comparing coins ${leftCoins.map(c => c + 1).join(', ')} with coins ${rightCoins.map(c => c + 1).join(', ')} will split the possibilities evenly, minimizing the worst-case number of steps needed.`;
};

// Function to calculate the optimal split for a given range of coins
const calculateOptimalSplit = (start, end) => {
  const key = `${start}-${end}`;
  
  // If already calculated, return from DP table
  if (dpTable.has(key)) {
    return dpTable.get(key);
  }

  const numCoins = end - start + 1;
  
  // Base cases
  if (numCoins <= 1) {
    return { split: [], steps: 0 };
  }
  if (numCoins === 2) {
    return { split: [start], steps: 1 };
  }

  // Calculate middle point for optimal split
  const mid = Math.floor((start + end) / 2);
  const leftCoins = [];
  const rightCoins = [];

  // Create balanced groups
  for (let i = start; i <= mid; i++) {
    leftCoins.push(i);
  }
  for (let i = mid + 1; i <= end; i++) {
    rightCoins.push(i);
  }

  // Store result in DP table
  const result = {
    split: leftCoins,
    steps: 1 + Math.max(
      calculateOptimalSplit(start, mid).steps,
      calculateOptimalSplit(mid + 1, end).steps
    )
  };
  dpTable.set(key, result);
  
  return result;
};

// Component to display DP state and recommendations
const DPStateDisplay = ({ coins, possibleFakeCoins, lastWeighing }) => {
  const remainingCoins = possibleFakeCoins.length;
  const optimalSplit = calculateOptimalSplit(0, possibleFakeCoins.length - 1);
  const explanation = generateExplanation(possibleFakeCoins, optimalSplit);
  
  return (
    <div className="dp-state-container">
      <h3>Dynamic Programming Analysis</h3>
      
      <div className="dp-info">
        <div className="dp-section">
          <h4>Current State</h4>
          <p>Possible fake coins remaining: {remainingCoins}</p>
          <p>Minimum steps needed: {optimalSplit.steps}</p>
        </div>

        {lastWeighing && (
          <div className="dp-section">
            <h4>Last Weighing Result</h4>
            <p>Left pan: {lastWeighing.leftPan.map(i => i + 1).join(', ')}</p>
            <p>Right pan: {lastWeighing.rightPan.map(i => i + 1).join(', ')}</p>
            <p>Result: {lastWeighing.result}</p>
          </div>
        )}

        <div className="dp-section">
          <h4>Recommended Next Move</h4>
          <p>Split coins into two groups:</p>
          <div className="dp-recommendation">
            <div>
              <strong>Left pan:</strong> {optimalSplit.split.map(i => possibleFakeCoins[i] + 1).join(', ')}
            </div>
            <div>
              <strong>Right pan:</strong> {possibleFakeCoins
                .filter((_, i) => !optimalSplit.split.includes(i))
                .map(c => c + 1)
                .join(', ')}
            </div>
          </div>
          <div className="dp-explanation">
            <p>{explanation}</p>
          </div>
        </div>

        <div className="dp-section">
          <h4>DP Table Status</h4>
          <p>Subproblems solved: {dpTable.size}</p>
          <p>Current state complexity: O(log {remainingCoins})</p>
        </div>
      </div>
    </div>
  );
};

export { DPStateDisplay, calculateOptimalSplit, dpTable, generateExplanation }; 