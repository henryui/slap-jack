import React from 'react';
import { Button, Tooltip } from 'antd';
import styled from 'styled-components';

interface SlapJackFooterProps {
  theirCards: number;
  cards: number;
  disabledNextCard: boolean;
  getNewCard: () => void;
  forfeitGame: () => void;
}

const SlapJackFooter: React.FC<SlapJackFooterProps> = ({
  theirCards,
  cards,
  disabledNextCard,
  getNewCard,
  forfeitGame,
}) => {
  return (
    <StyledFooter>
      <StyledNextCard
        size="large"
        type="primary"
        onClick={getNewCard}
        disabled={disabledNextCard}
      >
        Next Card ({cards} Remaining)
      </StyledNextCard>

      <StyledNewGame onClick={forfeitGame}>Forfeit</StyledNewGame>

      <Tooltip
        title="You will win when their card becomes zero and lose if yours becomes zero."
        placement="right"
      >
        <StyledTheirs type="dashed">
          They have {theirCards} cards remaining
        </StyledTheirs>
      </Tooltip>
    </StyledFooter>
  );
};

export default SlapJackFooter;

const StyledFooter = styled.div`
  margin: 20px 0;
  display: flex;
`;

const StyledNextCard = styled(Button)`
  && {
    padding: 15px 25px;
    height: 60px;
  }
  margin-right: 25px;
`;

const StyledNewGame = styled(Button)`
  && {
    padding: 15px 25px;
    height: 60px;
    font-weight: bold;
  }
`;

const StyledTheirs = styled(Button)`
  && {
    padding: 15px 25px;
    height: 60px;
    cursor: default;
  }
  margin-left: 25px;
`;
