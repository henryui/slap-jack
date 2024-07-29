import React from 'react';
import { SlapJackContextProvider } from './SlapJackContext';
import SlapJackContainer from './SlapJackContainer';

const SlapJackPage: React.FC = () => {
  return (
    <SlapJackContextProvider>
      <SlapJackContainer />
    </SlapJackContextProvider>
  );
};

export default SlapJackPage;
