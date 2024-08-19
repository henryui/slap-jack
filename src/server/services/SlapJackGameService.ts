import { cloneDeep } from 'lodash';
import { Types } from 'mongoose';
import moment from 'moment';
// import NodeCache from 'node-cache';
import {
  CardNumber,
  CardShape,
  GameDifficulty,
  PlayingCardType,
  SlapJackGameConfig,
  SlapJackGameMode,
  SlapJackGameType,
} from '../../../types';
import { CronJobService, SocketService } from './index';
import { ObjectId, SlapJackGame } from '../schemas';
import {
  cardNumberMap,
  cardNumberSequenceMap,
  cardShapeMap,
} from '../constants';

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

const HARD_AI_INT_DIFF = parseInt(process.env.HARD_AI_INT_DIFF || '500', 10);

// # SLAP INTERVAL
const AI_SLAP_INT_DIFF = 100;

const EASY_AI_SLAP_INT = parseInt(process.env.EASY_AI_SLAP_INT || '1400', 10);

const MEDIUM_AI_SLAP_INT = parseInt(
  process.env.MEDIUM_AI_SLAP_INT || '1100',
  10,
);

const HARD_AI_SLAP_INT = parseInt(process.env.HARD_AI_SLAP_INT || '800', 10);

class SlapJackGameService {
  // TODO: Move this in-memory game object into NodeCache with TTL
  private gameJobs: Record<
    string,
    {
      gameInfo: SlapJackGameType;
      socketId: string;
      timeoutJobId?: NodeJS.Timeout;
      inEvent?: boolean;
      startDate: Date;
    }
  > = {};

  private alhpaCards = [
    CardNumber.Ace,
    CardNumber.King,
    CardNumber.Queen,
    CardNumber.Jack,
  ];

  private defaultGameConfig: SlapJackGameConfig = {
    mode: SlapJackGameMode.AI,
    // Only exists with AI mode.
    difficulty: GameDifficulty.Medium,
    pair: true,
    oneBetweenPair: true,
    sequence: true,
    alphaCardRules: true,
  };

  public startCleanupCron() {
    const cleanUp = () => {
      const before24h = moment(new Date()).subtract(1, 'day');
      const gameIds = Object.keys(this.gameJobs);
      gameIds.forEach((gameId) => {
        if (!this.gameJobs[gameId]) return;
        if (before24h.isSameOrAfter(moment(this.gameJobs[gameId].startDate))) {
          delete this.gameJobs[gameId];
        }
      });
    };
    CronJobService.startCronJob('0 0 0 * *', cleanUp);
    // TODO: set a class getter for cleaned up game jobs, and if not exist, force quit the game.
  }

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

  // Should always be run after canTake check
  private shouldKeepTurn(cards: PlayingCardType[]) {
    if (!cards?.length || this.alhpaCards.includes(cards[0].number)) {
      return false;
    }
    // Proceed with Queen+
    if (
      cards.length >= 2 &&
      [CardNumber.Queen, CardNumber.King, CardNumber.Ace].includes(
        cards[1].number,
      )
    ) {
      return true;
    }
    // Proceed with King+
    if (
      cards.length >= 3 &&
      !this.alhpaCards.includes(cards[1].number) &&
      [CardNumber.King, CardNumber.Ace].includes(cards[2].number)
    ) {
      return true;
    }
    // Proceed with Ace
    if (
      cards.length >= 4 &&
      !this.alhpaCards.includes(cards[1].number) &&
      !this.alhpaCards.includes(cards[2].number) &&
      cards[3].number === CardNumber.Ace
    ) {
      return true;
    }
    return false;
  }

  private canTakeCards(cards: PlayingCardType[]) {
    if (!cards?.length || this.alhpaCards.includes(cards[0].number)) {
      return false;
    }
    // Take with Jack
    if (cards.length >= 2 && cards[1].number === CardNumber.Jack) {
      return true;
    }
    // Take with Queen
    if (
      cards.length >= 3 &&
      !this.alhpaCards.includes(cards[1].number) &&
      cards[2].number === CardNumber.Queen
    ) {
      return true;
    }
    // Take with King
    if (
      cards.length >= 4 &&
      !this.alhpaCards.includes(cards[1].number) &&
      !this.alhpaCards.includes(cards[2].number) &&
      cards[3].number === CardNumber.King
    ) {
      return true;
    }
    // Take with Ace
    if (
      cards.length >= 5 &&
      !this.alhpaCards.includes(cards[1].number) &&
      !this.alhpaCards.includes(cards[2].number) &&
      !this.alhpaCards.includes(cards[3].number) &&
      cards[4].number === CardNumber.Ace
    ) {
      return true;
    }
    return false;
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

    const keep =
      gameInfo.gameConfig.alphaCardRules &&
      this.shouldKeepTurn(gameInfo.playedCardSet);
    const canTake =
      gameInfo.gameConfig.alphaCardRules &&
      this.canTakeCards(gameInfo.playedCardSet);
    SocketService.emitSocketEvent('newCard', socketId, {
      cards: rest.length,
      playedCard: selected,
      turnChange: !keep && !canTake,
      canTake,
    });

    if (gameInfo.gameConfig.mode === SlapJackGameMode.AI) {
      // Check if AI can slap
      const cardSet = this.transformToString(gameInfo.playedCardSet);
      const isValid = this.validateSlap(gameInfo.gameConfig, cardSet);
      if (isValid) {
        // Set slap card job
        this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
          this.slapCard({ gameId, cardSet });
        }, this.getSlapInterval(gameId));
        return;
      }
    }

    if (canTake) {
      const userId =
        gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
        gameInfo.turn === '1'
          ? undefined
          : gameInfo.turn === '1'
            ? gameInfo.player2Id?.toString()
            : gameInfo.player1Id?.toString();

      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.slapCardSuccess({ gameId, fromTake: true, userId });
      }, this.getSlapInterval(gameId));

      return;
    }

    if (
      (gameInfo.turn === '2' && !gameInfo.player1CardSet.length) ||
      (gameInfo.turn === '1' && !gameInfo.player2CardSet.length)
    ) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }

    if (
      gameInfo.turn === '1' &&
      gameInfo.gameConfig.mode === SlapJackGameMode.AI
    ) {
      // set AI get next card job
      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.getNextCardAI(gameId);
      }, this.getWaitInterval(gameId));
    }

    // shouldKeepTurn
    if (!keep) {
      gameInfo.turn = gameInfo.turn === '1' ? '2' : '1';
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

    const keep =
      gameInfo.gameConfig.alphaCardRules &&
      this.shouldKeepTurn(gameInfo.playedCardSet);
    const canTake =
      gameInfo.gameConfig.alphaCardRules &&
      this.canTakeCards(gameInfo.playedCardSet);
    SocketService.emitSocketEvent('newCard', socketId, {
      cards: gameInfo.player1CardSet.length,
      playedCard: selected,
      turnChange: !keep && !canTake,
      canTake,
    });

    // Check if AI can slap
    const cardSet = this.transformToString(gameInfo.playedCardSet);
    const isValid = this.validateSlap(gameInfo.gameConfig, cardSet);
    if (isValid) {
      // Set slap card job
      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.slapCard({ gameId, cardSet });
      }, this.getSlapInterval(gameId));
      return;
    }

    if (canTake) {
      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.slapCardSuccess({
          gameId,
          fromTake: true,
          userId: gameInfo.player1Id.toString(),
        });
      }, this.getSlapInterval(gameId));

      return;
    }

    if (
      (!keep && !gameInfo.player1CardSet.length) ||
      (keep && !gameInfo.player2CardSet.length)
    ) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }

    if (keep) {
      // set AI get next card job
      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.getNextCardAI(gameId);
      }, this.getWaitInterval(gameId));
    } else {
      gameInfo.turn = '1';
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

  public slapCard({
    gameId,
    cardSet,
    userId,
  }: {
    gameId: string;
    cardSet: string;
    userId?: string;
  }) {
    if (this.gameJobs[gameId].inEvent) return;
    this.gameJobs[gameId].inEvent = true;
    if (this.gameJobs[gameId].timeoutJobId) {
      clearTimeout(this.gameJobs[gameId].timeoutJobId);
      this.gameJobs[gameId].timeoutJobId = undefined;
    }

    try {
      const isValid = this.validateSlapWithError(gameId, cardSet, userId);
      if (isValid) {
        this.slapCardSuccess({ gameId, userId });
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

  private slapCardSuccess({
    gameId,
    userId,
    fromTake,
  }: {
    gameId: string;
    userId?: string;
    fromTake?: boolean;
  }) {
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

    const handleWin =
      !gameInfo.player1CardSet.length || !gameInfo.player2CardSet.length;

    if (userId) {
      SocketService.emitSocketEvent(
        'slapSuccess',
        this.gameJobs[gameId].socketId,
        {
          cards: gameInfo.player1CardSet.length,
          newTurn,
          gameEnd: handleWin,
          fromTake,
          slapUser: userId,
        },
      );
    } else {
      SocketService.emitSocketEvent(
        'slapSuccess',
        this.gameJobs[gameId].socketId,
        {
          newTurn,
          gameEnd: handleWin,
          fromTake,
        },
      );
      this.gameJobs[gameId].timeoutJobId = setTimeout(
        () => {
          this.getNextCardAI(gameId);
        },
        this.getWaitInterval(gameId, true),
      );
    }

    // TODO: Handle slap at zero stack
    if (handleWin) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
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

    const handleWin =
      !gameInfo.player1CardSet.length || !gameInfo.player2CardSet.length;

    if (userId === gameInfo.player1Id.toString()) {
      SocketService.emitSocketEvent(
        'slapFailure',
        this.gameJobs[gameId].socketId,
        {
          cards: gameInfo.player1CardSet.length,
          gameEnd: handleWin,
        },
      );
    } else {
      // TODO: Implement Multiplayer game
    }

    if (handleWin) {
      const winner = !gameInfo.player2CardSet.length
        ? gameInfo.player1Id
        : gameInfo.player2Id || undefined;
      this.handleWinLose(gameId, winner);
      return;
    }

    // Continue on Skipped card take action if it needs
    const canTake =
      gameInfo.gameConfig.alphaCardRules &&
      this.canTakeCards(gameInfo.playedCardSet);
    if (canTake) {
      const userId =
        gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
        gameInfo.turn === '1'
          ? undefined
          : gameInfo.turn === '1'
            ? gameInfo.player2Id?.toString()
            : gameInfo.player1Id?.toString();

      this.gameJobs[gameId].timeoutJobId = setTimeout(() => {
        this.slapCardSuccess({ gameId, fromTake: true, userId });
      }, this.getSlapInterval(gameId));

      return;
    }
    // For AI Turn
    if (
      gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
      gameInfo.turn === '1'
    ) {
      this.gameJobs[gameId].timeoutJobId = setTimeout(
        () => {
          this.getNextCardAI(gameId);
        },
        this.getWaitInterval(gameId, true),
      );
    }
  }

  private handleWinLose(
    gameId: string,
    winner?: Types.ObjectId,
    skipEvent?: boolean,
  ) {
    if (!skipEvent) {
      // TODO: Multiplayer socket
      SocketService.emitSocketEvent('gameEnd', this.gameJobs[gameId].socketId, {
        winner: winner?.toString(),
      });
    }

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
    gameConfig?: SlapJackGameConfig;
    socketId: string;
  }) {
    const {
      player1Id,
      player2Id,
      gameConfig = this.defaultGameConfig,
      socketId,
    } = options;
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
    this.gameJobs[gameInfo._id.toString()] = {
      gameInfo,
      socketId,
      startDate: new Date(),
    };

    return {
      gameId: gameInfo._id.toString(),
      turn,
      cards: player1CardSet.length,
      playerNum: '1', // TODO: Only AI mode for now,
      gameMode: gameInfo.gameConfig.mode,
    };
  }

  public forfeitGame(gameId: string, requestedUser: string) {
    if (!gameId || !requestedUser) return;

    const { gameInfo } = this.gameJobs[gameId];
    const winner =
      gameInfo.player1Id.toString() === requestedUser
        ? gameInfo.player2Id
        : gameInfo.player1Id;

    this.handleWinLose(gameId, winner, true);
    // await SlapJackGame.findByIdAndUpdate(gameId, {
    //   isDeleted: true,
    // });
  }
}

export default new SlapJackGameService();
