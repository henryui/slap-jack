import { cloneDeep } from 'lodash';
import {
  CardNumber,
  CardShape,
  GameDifficulty,
  PlayingCardType,
  SlapJackGameConfig,
  SlapJackGameMode,
  SlapJackGameType,
} from '../../../types';
import SocketService from './SocketService';
import { ObjectId, SlapJackGame } from '../schemas';
import {
  cardNumberMap,
  cardNumberSequenceMap,
  cardShapeMap,
} from '../constants';
import { Types } from 'mongoose';

// This is a mongodb collection class

// In milliseconds

// # WAIT INTERVAL
const AI_POST_SLAP_INTERVAL = 5500;

const EASY_AI_WAIT_INTERVAL = parseInt(
  process.env.EASY_AI_WAIT_INTERVAL || '1500',
  10,
);

const MEDIUM_AI_WAIT_INTERVAL = parseInt(
  process.env.MEDIUM_AI_WAIT_INTERVAL || '1250',
  10,
);

const HARD_AI_WAIT_INTERVAL = parseInt(
  process.env.HARD_AI_WAIT_INTERVAL || '1000',
  10,
);

// # INT DIFF
const EASY_AI_INT_DIFF = parseInt(process.env.EASY_AI_INT_DIFF || '100', 10);

const MEDIUM_AI_INT_DIFF = parseInt(
  process.env.MEDIUM_AI_INT_DIFF || '300',
  10,
);

const HARD_AI_INT_DIFF = parseInt(process.env.EASY_AI_INT_DIFF || '500', 10);

// # SLAP INTERVAL
const AI_SLAP_INT_DIFF = 100;

const EASY_AI_SLAP_INT = parseInt(process.env.EASY_AI_SLAP_INT || '1100', 10);

const MEDIUM_AI_SLAP_INT = parseInt(
  process.env.MEDIUM_AI_SLAP_INT || '850',
  10,
);

const HARD_AI_SLAP_INT = parseInt(process.env.HARD_AI_SLAP_INT || '550', 10);

class SlapJackGameService {
  private gameJobs: Record<
    string,
    {
      gameInfo: SlapJackGameType;
      socketId: string;
      timeoutJobId?: NodeJS.Timeout;
      inEvent?: boolean;
    }
  > = {};

  private getSlapInterval(gameId: string) {
    const plusMinus = Math.random() > 0.5 ? -1 : 1;
    let slapInterval = EASY_AI_SLAP_INT;
    if (
      this.gameJobs[gameId].gameInfo.gameConfig.difficulty ===
      GameDifficulty.Hard
    ) {
      slapInterval = HARD_AI_SLAP_INT;
    }

    if (
      this.gameJobs[gameId].gameInfo.gameConfig.difficulty ===
      GameDifficulty.Medium
    ) {
      slapInterval = MEDIUM_AI_SLAP_INT;
    }

    const diff = Math.ceil(Math.random() * AI_SLAP_INT_DIFF);
    return slapInterval + plusMinus * diff;
  }

  private getWaitInterval(gameId: string, postSlap?: boolean) {
    const plusMinus = Math.random() > 0.5 ? -1 : 1;
    let variableDiff = EASY_AI_INT_DIFF;
    let waitInterval = EASY_AI_WAIT_INTERVAL;
    if (
      this.gameJobs[gameId].gameInfo.gameConfig.difficulty ===
      GameDifficulty.Hard
    ) {
      variableDiff = HARD_AI_INT_DIFF;
      waitInterval = HARD_AI_WAIT_INTERVAL;
    }

    if (
      this.gameJobs[gameId].gameInfo.gameConfig.difficulty ===
      GameDifficulty.Medium
    ) {
      variableDiff = MEDIUM_AI_INT_DIFF;
      waitInterval = MEDIUM_AI_WAIT_INTERVAL;
    }

    const diff = Math.ceil(Math.random() * variableDiff);
    return (postSlap ? AI_POST_SLAP_INTERVAL : waitInterval) + plusMinus * diff;
  }

  public getNextCard(gameId: string, userId?: string) {
    if (this.gameJobs[gameId].inEvent) return;
    if (this.gameJobs[gameId].timeoutJobId) {
      clearTimeout(this.gameJobs[gameId].timeoutJobId);
      this.gameJobs[gameId].timeoutJobId = undefined;
    }

    const { gameInfo, socketId } = this.gameJobs[gameId];
    if (
      (gameInfo.gameConfig.mode !== SlapJackGameMode.AI &&
        (!userId ||
          gameInfo[`player${gameInfo.turn}Id`]?.toString() !== userId)) ||
      (gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
        gameInfo.turn !== '1')
    ) {
      SocketService.emitSocketEvent('error', socketId, 'It is not your turn.');
      return;
    }

    const [selected, ...rest] = gameInfo[
      `player${gameInfo.turn}CardSet`
    ] as SlapJackGameType['player1CardSet'];
    gameInfo[`player${gameInfo.turn}CardSet`] = rest;
    gameInfo.playedCardSet = [selected, ...gameInfo.playedCardSet];
    gameInfo.turn = gameInfo.turn === '1' ? '2' : '1';

    SocketService.emitSocketEvent('newCard', socketId, {
      cards: rest.length,
      playedCard: selected,
    });

    // TODO: Handle slap at zero stack
    if (!gameInfo.player1CardSet.length || !gameInfo.player2CardSet.length) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }

    if (gameInfo.gameConfig.mode === SlapJackGameMode.AI) {
      // Check if AI can slap
      const cardSet = this.transformToString(gameInfo.playedCardSet);
      const isValid = this.validateSlap(gameInfo.gameConfig, cardSet);
      if (isValid) {
        // Set slap card job
        this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
          this.slapCard(gameId, cardSet);
        }, this.getSlapInterval(gameId));
      } else {
        // set AI get next card job
        this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
          this.getNextCardAI(gameId);
        }, this.getWaitInterval(gameId));
      }
    }
  }

  public getNextCardAI(gameId: string) {
    if (this.gameJobs[gameId].inEvent) return;
    const { gameInfo, socketId } = this.gameJobs[gameId];
    if (
      gameInfo.gameConfig.mode !== SlapJackGameMode.AI ||
      gameInfo.turn !== '2'
    ) {
      return;
    }

    const [selected, ...rest] = gameInfo.player2CardSet;
    gameInfo.player2CardSet = rest;
    gameInfo.playedCardSet = [selected, ...gameInfo.playedCardSet];
    gameInfo.turn = '1';
    SocketService.emitSocketEvent('newCard', socketId, {
      cards: gameInfo.player1CardSet.length,
      playedCard: selected,
      turnChange: true,
    });

    // TODO: Handle slap at zero stack
    if (!gameInfo.player1CardSet.length || !gameInfo.player2CardSet.length) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }

    // Check if AI can slap
    const cardSet = this.transformToString(gameInfo.playedCardSet);
    const isValid = this.validateSlap(gameInfo.gameConfig, cardSet);
    if (isValid) {
      // Set slap card job
      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.slapCard(gameId, cardSet);
      }, this.getSlapInterval(gameId));
    }
  }

  private transformToString(cards: PlayingCardType[]) {
    let result = '';
    if (!cards.length) return result;

    cards.slice(0, 3).forEach((card) => {
      result += cardShapeMap[card.shape];
      result += cardNumberMap[card.number];
    });

    return result;
  }

  private validateSlap(gameConfig: SlapJackGameConfig, cardSet: string) {
    if (cardSet.length <= 2) return false;

    if (cardSet[3] && cardSet[1] === cardSet[3] && gameConfig.pair) {
      return true;
    }

    if (cardSet[5] && cardSet[1] === cardSet[5] && gameConfig.oneBetweenPair) {
      return true;
    }

    if (
      cardSet[5] &&
      gameConfig.sequence &&
      cardNumberSequenceMap[cardSet[1] + cardSet[3] + cardSet[5]]
    ) {
      return true;
    }

    return false;
  }

  private validateSlapWithError(
    gameId: string,
    cardSet: string,
    userId?: string,
  ) {
    //
    const { gameInfo } = this.gameJobs[gameId];
    const cardSetStored = this.transformToString(gameInfo.playedCardSet);
    if (cardSetStored !== cardSet) {
      throw new Error(
        'Slap is invalid due to delay in remaining cards again when you slapped.',
      );
    } else if (!userId && gameInfo.gameConfig.mode !== SlapJackGameMode.AI) {
      throw new Error('Slap is invalid without userId in a multiplayer game.');
    }

    return this.validateSlap(gameInfo.gameConfig, cardSet);
  }

  public slapCard(gameId: string, cardSet: string, userId?: string) {
    if (this.gameJobs[gameId].inEvent) return;
    this.gameJobs[gameId].inEvent = true;
    if (this.gameJobs[gameId].timeoutJobId) {
      clearTimeout(this.gameJobs[gameId].timeoutJobId);
      this.gameJobs[gameId].timeoutJobId = undefined;
    }

    try {
      const isValid = this.validateSlapWithError(gameId, cardSet, userId);
      if (isValid) {
        this.slapCardSuccess(gameId, userId);
      } else {
        this.slapCardFailure(gameId, userId);
      }
      this.gameJobs[gameId].inEvent = false;
    } catch (err) {
      SocketService.emitSocketEvent(
        'error',
        this.gameJobs[gameId].socketId,
        err.message,
      );
      this.gameJobs[gameId].inEvent = false;

      if (
        this.gameJobs[gameId].gameInfo.gameConfig.mode ===
          SlapJackGameMode.AI &&
        this.gameJobs[gameId].gameInfo.turn === '2'
      ) {
        // set AI get next card job
        this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
          this.getNextCardAI(gameId);
        }, this.getWaitInterval(gameId));
      }
    }
  }

  private slapCardSuccess(gameId: string, userId?: string) {
    const { gameInfo } = this.gameJobs[gameId];
    const reversedSet = cloneDeep(gameInfo.playedCardSet).reverse();
    const playerField =
      userId && userId === gameInfo.player1Id.toString()
        ? 'player1CardSet'
        : 'player2CardSet';
    gameInfo[playerField] = [...gameInfo[playerField], ...reversedSet];
    gameInfo.playedCardSet = [];

    const newTurn =
      userId && userId === gameInfo.player1Id.toString() ? '1' : '2';
    gameInfo.turn = newTurn;

    if (userId) {
      SocketService.emitSocketEvent(
        'slapSuccess',
        this.gameJobs[gameId].socketId,
        {
          cards: gameInfo.player1CardSet.length,
          newTurn,
        },
      );
    } else {
      SocketService.emitSocketEvent(
        'slapSuccess',
        this.gameJobs[gameId].socketId,
        {
          newTurn,
        },
      );
      this.gameJobs[gameId].timeoutJobId = setTimeout(
        () => {
          this.getNextCardAI(gameId);
        },
        this.getWaitInterval(gameId, true),
      );
    }
  }

  private slapCardFailure(gameId: string, userId?: string) {
    // AI shouldn't fail slap for now.
    if (!userId) return;

    const { gameInfo } = this.gameJobs[gameId];
    const playerField =
      userId === gameInfo.player1Id.toString()
        ? 'player1CardSet'
        : 'player2CardSet';
    const otherPlayerField =
      userId === gameInfo.player1Id.toString()
        ? 'player2CardSet'
        : 'player1CardSet';

    if (gameInfo[playerField].length) {
      const [give, ...rest] = gameInfo[playerField];
      gameInfo[otherPlayerField] = [...gameInfo[otherPlayerField], give];
      gameInfo[playerField] = rest;
    }

    if (userId === gameInfo.player1Id.toString()) {
      SocketService.emitSocketEvent(
        'slapFailure',
        this.gameJobs[gameId].socketId,
        {
          cards: gameInfo.player1CardSet.length,
        },
      );
    } else {
      // TODO: Implement Multiplayer game
    }

    if (!gameInfo.player1CardSet.length || !gameInfo.player2CardSet.length) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }
    // For AI Turn
    if (
      gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
      gameInfo.turn === '2'
    ) {
      this.gameJobs[gameId].timeoutJobId = setTimeout(
        () => {
          this.getNextCardAI(gameId);
        },
        this.getWaitInterval(gameId, true),
      );
    }
  }

  private handleWinLose(gameId: string, winner?: Types.ObjectId) {
    // TODO: Single player socket
    SocketService.emitSocketEvent('gameEnd', this.gameJobs[gameId].socketId, {
      winner: winner?.toString(),
    });

    // Do not have to await for saving into DB
    SlapJackGame.findByIdAndUpdate(gameId, {
      ...(winner && { winner }),
      gameEnd: new Date(),
    });

    delete this.gameJobs[gameId];
  }

  private createShuffledDeck() {
    const cardDeck: PlayingCardType[] = [];
    Object.values(CardShape).forEach((shape) => {
      Object.values(CardNumber).forEach((number) => {
        cardDeck.push({
          shape,
          number,
        });
      });
    });

    for (let i = cardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
    }

    return cardDeck;
  }

  private validateGameConfig(
    gameConfig: SlapJackGameConfig,
    player2Id?: string,
  ) {
    if (gameConfig.mode === SlapJackGameMode.Player && !player2Id) {
      // throw error if no opponent player given
      throw new Error('Cannot create a multiplayer game without opponent');
    }
    if (gameConfig.mode === SlapJackGameMode.AI && !gameConfig.difficulty) {
      throw new Error('Cannot create an AI game without specifying difficulty');
    }
  }

  public async startGame(options: {
    player1Id: string;
    player2Id?: string;
    gameConfig: SlapJackGameConfig;
    socketId: string;
  }) {
    const { player1Id, player2Id, gameConfig, socketId } = options;
    // Validate GameConfig for proper game creation
    this.validateGameConfig(gameConfig, player2Id);

    const newDeck = this.createShuffledDeck();
    const player1CardSet = newDeck.slice(0, newDeck.length / 2);
    const player2CardSet = newDeck.slice(newDeck.length / 2);

    let turn = Math.random() > 0.5 ? '1' : '2';
    if (gameConfig.mode === SlapJackGameMode.AI) turn = '1';

    const createdGame = await SlapJackGame.create({
      turn,
      player1Id: ObjectId(player1Id),
      ...(player2Id && { player2Id: Object(player2Id) }),
      gameConfig,
      playedCardSet: [],
      player1CardSet,
      player2CardSet,
      player1Misclicks: 0,
      player1Hits: 0,
      player2Misclicks: 0,
      player2Hits: 0,
    });
    const gameInfo = createdGame.toObject();
    this.gameJobs[gameInfo._id.toString()] = { gameInfo, socketId };

    return {
      gameId: gameInfo._id.toString(),
      turn,
      cards: player1CardSet.length,
      playerNum: '1', // TODO: Only AI mode for now,
      gameMode: gameInfo.gameConfig.mode,
    };
  }

  public async deleteGame(gameId: string) {
    if (!gameId) return;
    await SlapJackGame.findByIdAndUpdate(gameId, {
      isDeleted: true,
    });
    delete this.gameJobs[gameId];
  }
}

export default new SlapJackGameService();
