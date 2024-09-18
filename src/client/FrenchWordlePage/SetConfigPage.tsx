import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import type { InputProps } from 'antd';
import { Button, Divider, Input, Space } from 'antd';
import FrenchWordleContext from './FrenchWordleContext';

interface SetConfigPageProps {}

const SetConfigPage: React.FC<SetConfigPageProps> = () => {

    return (
        // Set up difficulty or # of questions, whatever that configures the game.
        <>
            <StyledHeader>
                <h1>FrenchWordle Game Config Page</h1>
            </StyledHeader>
        </>
    )
}

export default SetConfigPage;

const StyledHeader = styled.div`
    display: flex;
    justify-content: center;
`