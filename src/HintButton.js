import React, { useState } from 'react';
import { DPStateDisplay } from './DPLogic';

const HintButton = ({ coins, possibleFakeCoins, lastWeighing }) => {
  const [isHintVisible, setIsHintVisible] = useState(false);

  const handleOpenHint = () => {
    setIsHintVisible(true);
  };

  const handleCloseHint = () => {
    setIsHintVisible(false);
  };

  return (
    <>
      <button className="hint-button" onClick={handleOpenHint}>
        <span role="img" aria-label="hint">💡</span>
        Get Hint
      </button>

      {isHintVisible && (
        <>
          <div className="hint-overlay" onClick={handleCloseHint} />
          <div className="hint-popup">
            <button className="close-button" onClick={handleCloseHint}>×</button>
            <DPStateDisplay
              coins={coins}
              possibleFakeCoins={possibleFakeCoins}
              lastWeighing={lastWeighing}
            />
          </div>
        </>
      )}
    </>
  );
};

export default HintButton; 