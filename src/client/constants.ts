import { CardShape, CardNumber, PlayingCard } from './types';

export const generateFullDeck = () => {
  const cardDeck: PlayingCard[] = [];
  Object.values(CardShape).forEach((shape) => {
    Object.values(CardNumber).forEach((number) => {
      cardDeck.push({
        shape,
        number
      });
    });
  });

  return cardDeck;
};

export const selectRandomly = (deck: PlayingCard[]) => {
  const selectionIndex = Math.floor(Math.random() * deck.length);

  return {
    selected: deck[selectionIndex],
    rest: [...deck.slice(0, selectionIndex), ...deck.slice(selectionIndex + 1)]
  };
};
