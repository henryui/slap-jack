export enum CardShape {
  Spades = 'Spades',
  Heart = 'Heart',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds'
}

export enum CardNumber {
  Ace = 'Ace',
  Two = 'Two',
  Three = 'Three',
  Four = 'Four',
  Five = 'Five',
  Six = 'Six',
  Seven = 'Seven',
  Eight = 'Eight',
  Nine = 'Nine',
  Ten = 'Ten',
  Jack = 'Jack',
  Queen = 'Queen',
  King = 'King'
}

export type PlayingCard = {
  shape: CardShape;
  number: CardNumber;
};
