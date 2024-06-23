import { Types } from 'mongoose';

export type UserType = {
  username: string;
  wins: number;
  loses: number;
  createdAt: Date;
  updatedAt: Date;
};

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

export enum GameDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export type SlapJackGameType = {
  turn: '1' | '2';
  player1Id: Types.ObjectId;
  // If none, then the game is against AI.
  player2Id?: Types.ObjectId;
  gameConfig: SlapJackGameConfig;
  playedCardSet: PlayingCardType[];
  player1CardSet: PlayingCardType[];
  player2CardSet: PlayingCardType[];
  player1Misclicks: number;
  player1Hits: number;
  player2Misclicks: number;
  player2Hits: number;
  // End game
  gameEnd?: Date;
  winner?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export enum SlapJackGameMode {
  AI = 'AI',
  Player = 'Player',
}

export type SlapJackGameConfig = {
  mode: SlapJackGameMode;
  // Only exists with AI mode.
  difficulty?: GameDifficulty;
  pair: boolean;
  oneBetweenPair: boolean;
  sequence: boolean;
  alphaCardRules: boolean;
};
