import React from 'react';
import { MafiaGameContextProvider } from './MafiaGameContext';
import MafiaGameContainer from './MafiaGameContainer';

const MafiaGamePage: React.FC = () => {
  return (
    <MafiaGameContextProvider>
      <MafiaGameContainer />
    </MafiaGameContextProvider>
  );
};

export default MafiaGamePage;
