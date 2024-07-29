/// <reference types="../types.d.ts" />
import React from 'react';
import styled from 'styled-components';
import { CardNumber, CardShape } from '../types';
import spadeSvg from '../img/spade.svg';
import clubSvg from '../img/club.svg';
import heartSvg from '../img/heart.svg';
import diamondSvg from '../img/diamond.svg';

const COLOR_MAP: Record<CardShape, string> = {
  [CardShape.Spades]: 'black',
  [CardShape.Clubs]: 'black',
  [CardShape.Hearts]: 'red',
  [CardShape.Diamonds]: 'red',
};

const NUMBER_MAP: Record<CardNumber, string> = {
  [CardNumber.Ace]: 'A',
  [CardNumber.Two]: '2',
  [CardNumber.Three]: '3',
  [CardNumber.Four]: '4',
  [CardNumber.Five]: '5',
  [CardNumber.Six]: '6',
  [CardNumber.Seven]: '7',
  [CardNumber.Eight]: '8',
  [CardNumber.Nine]: '9',
  [CardNumber.Ten]: '10',
  [CardNumber.Jack]: 'J',
  [CardNumber.Queen]: 'Q',
  [CardNumber.King]: 'K',
};

const ICON_MAP: Record<CardShape, string> = {
  [CardShape.Spades]: spadeSvg,
  [CardShape.Clubs]: clubSvg,
  [CardShape.Hearts]: heartSvg,
  [CardShape.Diamonds]: diamondSvg,
};

interface PlayingCardProps {
  shape: CardShape;
  number: CardNumber;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ shape, number }) => (
  <StyledPaddingBorder>
    <StyledCardGrid>
      <StyledTopBottomRow $isTop>
        <StyledShapeNumber $isTop>
          <StyledNumber $color={COLOR_MAP[shape]}>
            {NUMBER_MAP[number]}
          </StyledNumber>
          <StyledShape src={ICON_MAP[shape]} />
        </StyledShapeNumber>
      </StyledTopBottomRow>
      <StyledMiddleRow>
        <StyledMajorShape src={ICON_MAP[shape]} />
      </StyledMiddleRow>
      <StyledTopBottomRow>
        <StyledShapeNumber>
          <StyledNumber $color={COLOR_MAP[shape]}>
            {NUMBER_MAP[number]}
          </StyledNumber>
          <StyledShape src={ICON_MAP[shape]} />
        </StyledShapeNumber>
      </StyledTopBottomRow>
    </StyledCardGrid>
  </StyledPaddingBorder>
);

export default PlayingCard;

// TODO: Make hard-coded px responsive
const StyledPaddingBorder = styled.div`
  width: 270px;
  height: 404px;
  padding: 7px 5px;
  border: #909090 solid 3px;
  border-radius: 10px;
  box-shadow: 3px 5px 5px #cdcdcd;
  margin: 20px;
  background-color: white;
`;

// TODO: Make hard-coded px responsive
const StyledCardGrid = styled.div`
  width: 260px;
  height: 390px;

  display: grid;
  grid-template-rows: 30% 40% 30%;
`;

const StyledTopBottomRow = styled.div<{ $isTop?: boolean }>`
  display: flex;
  justify-content: ${({ $isTop }) => (!$isTop ? 'flex-start' : 'flex-end')};
  height: 100%;
`;

const StyledShapeNumber = styled.div<{ $isTop?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ $isTop }) => ($isTop ? 'flex-start' : 'flex-end')};
  align-items: center;
  width: 26%;
`;

// TODO: Make hard-coded px responsive
const StyledNumber = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
  margin-bottom: 3px;
  font-size: 4em;
  font-weight: bold;
`;

const StyledShape = styled.img`
  width: 60%;
  max-height: 37%;
`;

const StyledMiddleRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledMajorShape = styled.img`
  height: 100%;
  max-width: 100%;
`;
