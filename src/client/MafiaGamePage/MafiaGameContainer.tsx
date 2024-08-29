import React, { useContext } from 'react';
import styled from 'styled-components';
import { MAIN_HEADER_HEIGHT } from '@constants';
import { MafiaGameState } from '../types';
import SetConfigPage from './SetConfigPage';
import InGamePage from './InGamePage';
import WaitingRoomPage from './WaitingRoomPage';
import MafiaGameContext from './MafiaGameContext';

const MafiaGameContainer: React.FC = () => {
  const { gameState } = useContext(MafiaGameContext);
  return (
    <StyledMafiaGameWrapper>
      {gameState === MafiaGameState.setConfig && <SetConfigPage />}
      {gameState === MafiaGameState.inWaitingRoom && <WaitingRoomPage />}
      {gameState === MafiaGameState.inGame && <InGamePage />}
    </StyledMafiaGameWrapper>
  );
};

export default MafiaGameContainer;

const StyledMafiaGameWrapper = styled.div`
  margin-top: ${MAIN_HEADER_HEIGHT + 20}px;
  width: 250px;
`;
