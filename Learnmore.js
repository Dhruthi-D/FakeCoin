import React from "react";
import { Link } from "react-router-dom";

const LearnMore = () => {
  return (
    <div className="learn-more-container">
      <h1>🪙 The Fake Coin Problem - Explained</h1>

      <p>
        In the <strong>Fake Coin Problem</strong> using{" "}
        <strong>Decrease and Conquer by Constant Factor (k = 2)</strong>, we assume:
      </p>
      <ul>
        <li><strong>Exactly one fake coin</strong>, which is <strong>heavier</strong> than the rest.</li>
        <li>We can use a <strong>balance scale</strong> to compare two groups of coins.</li>
        <li>Each weighing helps eliminate <strong>half of the coins</strong>.</li>
      </ul>

      <p>
        This fits the <strong>"Decrease by a constant factor"</strong> strategy, specifically{" "}
        <strong>k = 2</strong> (i.e., divide coins into 2 halves).
      </p>

      <h2>🧠 Idea</h2>
      <ol>
        <li><strong>Divide</strong> the coins into two equal (or nearly equal) halves.</li>
        <li><strong>Weigh</strong> them against each other using a balance scale.</li>
        <li>The <strong>heavier side</strong> contains the fake coin.</li>
        <li><strong>Discard</strong> the lighter half.</li>
        <li><strong>Repeat</strong> the process until one coin remains – the fake one.</li>
      </ol>

      <h2>📘 Algorithm</h2>
      <pre className="code-block">
{`function findFakeCoin(coins):
    while coins.length > 1:
        split coins into left and right halves
        if left weighs more:
            coins = left
        else:
            coins = right
    return coins[0]  // this is the fake coin`}
      </pre>

      <h2>⏱ Time Complexity</h2>
      <ul>
        <li>At each step, reduce the number of coins by half → T(n) = T(n/2) + O(1)</li>
        <li><strong>Time:</strong> O(log n)</li>
        <li><strong>Space:</strong> O(1) (if iterative)</li>
      </ul>

      <Link to="/home" className="btn">🔙 Back to Home</Link>
    </div>
  );
};

export default LearnMore;