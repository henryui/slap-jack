// TODO: Move me to separate folders for typing
import { Types } from 'mongoose';

export type UserType = {
  _id: Types.ObjectId;
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
  _id: Types.ObjectId;
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
  isDeleted?: boolean;
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

export type MafiaGameConfig = {
  numMafias: number;
  numCops: number;
  numDoctors: number;
  multiSelect?: boolean;
};

export enum MafiaGameTurn {
  Day = 'Day',
  Mafia = 'Mafia',
  Cop = 'Cop',
  Doctor = 'Doctor',
}

export enum MafiaUserType {
  Civilian = 'Civilian',
  Mafia = 'Mafia',
  Cop = 'Cop',
  Doctor = 'Doctor',
}

export enum MafiaGameState {
  Waiting = 'Waiting',
  InGame = 'InGame',
  Ended = 'Ended',
}

export type MafiaGameUser = {
  localStorageId: string;
  userName: string;
  isMc?: boolean;
  userType?: MafiaUserType;
};

export type PickUser = {
  picker: string;
  picked: string;
};

export type MafiaGameType = {
  roomId: string;
  config: MafiaGameConfig;
  numPeopleLeft: number;
  turn: MafiaGameTurn;
  users: MafiaGameUser[];
  state: MafiaGameState;
  mafiaPick?: string;
  gameEnd?: Date;
  winner?: 'Civilians' | 'Mafias';
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MafiaGamePickType = {
  gameId: string;
  userType: MafiaUserType;
  pickerId: string;
  pickedId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FrenchWordleUser = UserType & {
  rejectedSubmissions: number;
}