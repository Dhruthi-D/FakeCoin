import React from 'react';

// DP table to store optimal moves and state information for each state
const dpTable = new Map();

// Function to calculate the optimal number of weighings needed for n coins
const calculateOptimalWeighings = (n) => Math.ceil(Math.log2(n));

// Function to generate a unique key for the DP table based on possible fake coins
const getStateKey = (coins) => coins.sort().join(',');

// Function to calculate the information gain for a particular split
const calculateInformationGain = (totalCoins, splitSize) => {
    const p1 = splitSize / totalCoins;
    const p2 = (totalCoins - splitSize) / totalCoins;
    return -(p1 * Math.log2(p1) + p2 * Math.log2(p2));
};

// Function to find the optimal split with equal coins on both pans
const findOptimalSplit = (possibleFakeCoins) => {
    const n = possibleFakeCoins.length;
    if (n <= 1) return { split: [], steps: 0, gain: 0 };

    const stateKey = getStateKey(possibleFakeCoins);
    if (dpTable.has(stateKey)) {
        return dpTable.get(stateKey);
    }

    // Always split into two equal groups, leave leftovers out
    const groupSize = Math.floor(n / 2);
    const leftGroup = possibleFakeCoins.slice(0, groupSize);
    const rightGroup = possibleFakeCoins.slice(groupSize, 2 * groupSize);
    // Leftover coins: possibleFakeCoins.slice(2 * groupSize)

    const currentGain = calculateInformationGain(n, groupSize);
    const worstCaseSteps = 1 + Math.max(
        calculateOptimalWeighings(leftGroup.length),
        calculateOptimalWeighings(rightGroup.length),
        n - 2 * groupSize > 0 ? calculateOptimalWeighings(n - 2 * groupSize) : 0
    );

    const bestSplit = {
        split: leftGroup,
        steps: worstCaseSteps,
        gain: currentGain
    };

    dpTable.set(stateKey, bestSplit);
    return bestSplit;
};

// Function to generate explanation for current DP suggestion
const generateExplanation = (possibleFakeCoins, optimalSplit) => {
    if (possibleFakeCoins.length <= 1) {
        return {
            text: "You can now make your final guess!",
            strategy: "Direct comparison",
            complexity: "O(1)"
        };
    }

    const leftCoins = optimalSplit.split;
    const rightCoins = possibleFakeCoins.filter(c => !leftCoins.includes(c));

    if (optimalSplit.steps === Infinity) {
        return {
            text: "You cannot split the coins evenly at this step. Try removing one coin and weighing the rest, or make a guess if you are confident.",
            strategy: "Remove a coin or guess",
            complexity: "—"
        };
    }

    if (possibleFakeCoins.length === 2) {
        return {
            text: `Compare coins ${leftCoins[0] + 1} and ${rightCoins[0] + 1} to determine which one is fake.`,
            strategy: "Binary comparison",
            complexity: "O(1)"
        };
    }

    return {
        text: `Based on DP analysis, comparing ${leftCoins.length} coins on each side will maximize information gain (${optimalSplit.gain.toFixed(2)} bits) and guarantee finding the fake coin in at most ${optimalSplit.steps} steps.`,
        complexity: `O(log ${possibleFakeCoins.length})`,
        strategy: "Divide and Conquer with DP optimization"
    };
};

// Component to display DP analysis and next weighing suggestion
const DPStateDisplay = ({ coins, possibleFakeCoins, lastWeighing }) => {
    const remainingCoins = possibleFakeCoins.length;
    const optimalSplit = findOptimalSplit(possibleFakeCoins);
    const explanation = generateExplanation(possibleFakeCoins, optimalSplit);

    const leftPan = optimalSplit.split;
    const rightPan = possibleFakeCoins.filter(c => !leftPan.includes(c));

    return (
        <div className="dp-state-container">
            <h3>Dynamic Programming Analysis</h3>

            <div className="dp-info">
                <div className="dp-section">
                    <h4>Current State</h4>
                    <div className="dp-table-status">
                        <p>Possible fake coins remaining: {remainingCoins}</p>
                        <p>Minimum steps needed: {optimalSplit.steps === Infinity ? '—' : optimalSplit.steps}</p>
                        <p>Algorithm complexity: <span className="complexity-badge">{explanation.complexity}</span></p>
                    </div>
                </div>

                {lastWeighing && (
                    <div className="dp-section">
                        <h4>Last Weighing Result</h4>
                        <div className="weighing-history">
                            <div className="weighing-result">
                                <p><strong>Left pan:</strong> {lastWeighing.leftPan.map(i => i + 1).join(', ')}</p>
                                <p><strong>Right pan:</strong> {lastWeighing.rightPan.map(i => i + 1).join(', ')}</p>
                                <p><strong>Result:</strong> {lastWeighing.result}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="dp-section">
                    <h4>DP-Guided Next Move</h4>
                    <p className="strategy-text">{explanation.strategy}</p>
                    {optimalSplit.steps === Infinity ? (
                        <p>Cannot weigh evenly. Try removing or guessing a coin.</p>
                    ) : (
                        <div className="dp-recommendation">
                            <div>
                                <strong>Left pan:</strong> {leftPan.map(c => c + 1).join(', ')}
                            </div>
                            <div>
                                <strong>Right pan:</strong> {rightPan.map(c => c + 1).join(', ')}
                            </div>
                        </div>
                    )}
                    <div className="dp-explanation">
                        <p>{explanation.text}</p>
                    </div>
                </div>

                <div className="dp-section">
                    <h4>DP Table Status</h4>
                    <div className="dp-table-status">
                        <p>Subproblems solved: {dpTable.size}</p>
                        <p>Information gain: {optimalSplit.gain.toFixed(2)} bits</p>
                        <p>Expected worst-case steps: {optimalSplit.steps === Infinity ? '—' : optimalSplit.steps}</p>
                        {optimalSplit.steps !== Infinity && (
                            <div
                                className="information-gain"
                                style={{
                                    width: `${(optimalSplit.gain / Math.log2(remainingCoins)) * 100}%`
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { DPStateDisplay, findOptimalSplit, calculateOptimalWeighings };
