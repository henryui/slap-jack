import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import styled from 'styled-components';
import { MAIN_HEADER_HEIGHT } from '@constants';

const { Text } = Typography;

const MainHeader: React.FC = () => (
  <StyledHeaderContainer>
    <Link to="/main">
      <StyledHome>Home</StyledHome>
    </Link>
    <Link to="/slap-jack">
      <StyledButton>Slap Jack</StyledButton>
    </Link>
  </StyledHeaderContainer>
);

export default MainHeader;

const StyledHeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${MAIN_HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  background-color: #333;
`;

const StyledButton = styled(Text)`
  color: #ddd;
  font-size: 16px;
  margin-right: 24px;
  height: ${MAIN_HEADER_HEIGHT}px;
`;

const StyledHome = styled(StyledButton)`
  font-weight: 700;
`;
