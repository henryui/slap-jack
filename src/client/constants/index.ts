import { CardShape, CardNumber, PlayingCardType } from '../types';

export const generateFullDeck = () => {
  const cardDeck: PlayingCardType[] = [];
  Object.values(CardShape).forEach((shape) => {
    Object.values(CardNumber).forEach((number) => {
      cardDeck.push({
        shape,
        number,
      });
    });
  });

  return cardDeck;
};

export const selectRandomly = (deck: PlayingCardType[]) => {
  const selectionIndex = Math.floor(Math.random() * deck.length);

  return {
    selected: deck[selectionIndex],
    rest: [...deck.slice(0, selectionIndex), ...deck.slice(selectionIndex + 1)],
  };
};

export const cardShapeMap: Record<CardShape, string> = {
  [CardShape.Clubs]: 'C',
  [CardShape.Diamonds]: 'D',
  [CardShape.Hearts]: 'H',
  [CardShape.Spades]: 'S',
};

export const cardNumberMap: Record<CardNumber, string> = {
  [CardNumber.Ace]: 'A',
  [CardNumber.Two]: '2',
  [CardNumber.Three]: '3',
  [CardNumber.Four]: '4',
  [CardNumber.Five]: '5',
  [CardNumber.Six]: '6',
  [CardNumber.Seven]: '7',
  [CardNumber.Eight]: '8',
  [CardNumber.Nine]: '9',
  [CardNumber.Ten]: '0',
  [CardNumber.Jack]: 'J',
  [CardNumber.Queen]: 'Q',
  [CardNumber.King]: 'K',
};

export const transformToString = (cards: PlayingCardType[]) => {
  let result = '';
  if (!cards.length) return result;

  cards.slice(0, 3).forEach((card) => {
    result += cardShapeMap[card.shape];
    result += cardNumberMap[card.number];
  });

  return result;
};

export const MAIN_HEADER_HEIGHT = 56;

export const TOTAL_CARDS = 52;

export const CARD_MODAL_CLOSE = 3000;
