import React from 'react';
import { FrenchWordleContextProvider } from './FrenchWordleContext';
import FrenchWordleContainer from './FrenchWordleContainer';

const MafiaGamePage: React.FC = () => {
  return (
    <FrenchWordleContextProvider>
      <FrenchWordleContainer />
    </FrenchWordleContextProvider>
  );
};

export default MafiaGamePage;
