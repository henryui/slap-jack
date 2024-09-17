import React, {useContext} from 'react';
import styled from 'styled-components';
import { MAIN_HEADER_HEIGHT } from '@constants';
import {FrenchWordleState} from '../types'
import SetConfigPage from './SetConfigPage';
import CreatePage from './CreatePage';
import InGamePage from './InGamePage';
import FrenchWordleContext from './FrenchWordleContext';

const FrenchWordleContainer: React.FC = () => {
    const {gameState} = useContext(FrenchWordleContext);
    return (
        <StyledFrenchWordleWrapper>
            {gameState === FrenchWordleState.setConfig && <SetConfigPage/>}
            {gameState === FrenchWordleState.setConfig && <CreatePage/>}
            {gameState === FrenchWordleState.setConfig && <InGamePage/>}
        </StyledFrenchWordleWrapper>
    )

}

export default FrenchWordleContainer;

const StyledFrenchWordleWrapper = styled.div `
    margin-top: ${MAIN_HEADER_HEIGHT + 20}px;
    width: 250px;
`;