import React, { useState } from 'react';
import { DPStateDisplay } from './DPLogic';

const ViewDPButton = ({ coins, possibleFakeCoins, lastWeighing }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button className="view-dp-button" onClick={handleOpenModal}>
        View Dynamic Programming Logic
      </button>
      
      <DPStateDisplay
        coins={coins}
        possibleFakeCoins={possibleFakeCoins}
        lastWeighing={lastWeighing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ViewDPButton; 