// FIXME: Potential duplciate from BE types
export enum CardShape {
  Spades = 'Spades',
  Hearts = 'Hearts',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
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
  King = 'King',
}

export type PlayingCardType = {
  shape: CardShape;
  number: CardNumber;
};

export enum SlapJackGameState {
  setConfig = 'setConfig',
  inGame = 'inGame',
}
