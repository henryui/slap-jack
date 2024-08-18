import React, { useContext } from 'react';
import styled from 'styled-components';
import { MAIN_HEADER_HEIGHT } from '@constants';
import { SlapJackGameState } from '../types';
import SetConfigPage from './SetConfigPage';
import InGamePage from './InGamePage';
import SlapJackContext from './SlapJackContext';

const SlapJackContainer: React.FC = () => {
  const { gameState } = useContext(SlapJackContext);
  return (
    <StyledSlapJackWrapper>
      {gameState === SlapJackGameState.setConfig && <SetConfigPage />}
      {gameState === SlapJackGameState.inGame && <InGamePage />}
    </StyledSlapJackWrapper>
  );
};

export default SlapJackContainer;

const StyledSlapJackWrapper = styled.div`
  margin-top: ${MAIN_HEADER_HEIGHT + 20}px;
  width: 640px;
`;
