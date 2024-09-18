import React, {useContext} from 'react';
import styled from 'styled-components';
import { MAIN_HEADER_HEIGHT } from '@constants';
import {FrenchWordleState} from '../types'
import SetConfigPage from './SetConfigPage';
import CreateQuestionsPage from './CreateQuestionsPage';
import InGamePage from './InGamePage';
import FrenchWordleContext from './FrenchWordleContext';

const FrenchWordleContainer: React.FC = () => {
    const {gameState} = useContext(FrenchWordleContext);
    console.log(`gameState: ${gameState}`);
    return (
        <StyledFrenchWordleWrapper>
            {gameState === FrenchWordleState.setConfig && <SetConfigPage/>}
            {gameState === FrenchWordleState.createQuestions && <CreateQuestionsPage/>}
            {gameState === FrenchWordleState.inGame && <InGamePage/>}
        </StyledFrenchWordleWrapper>
    )
}

export default FrenchWordleContainer;

const StyledFrenchWordleWrapper = styled.div `
    margin-top: ${MAIN_HEADER_HEIGHT + 20}px;
    width: 250px;
`;