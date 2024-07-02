import { CardNumber, CardShape } from '../../types';

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

const cardNumberSequenceHalf = [
  'A23',
  '234',
  '345',
  '456',
  '567',
  '678',
  '789',
  '890',
  '90J',
  '0JQ',
  'JQK',
  'QKA',
  'KA2',
];

export const cardNumberSequenceMap = cardNumberSequenceHalf.reduce<
  Record<string, boolean>
>((acc, cur) => {
  acc[cur] = true;
  acc[cur.split('').reverse().join('')] = true;
  return acc;
}, {});
