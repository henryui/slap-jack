import {
  CardNumber,
  CardShape,
  PlayingCardType,
  SlapJackGameConfig,
  SlapJackGameMode,
  SlapJackGameType,
} from '../../types';
import { ObjectId, SlapJackGame } from './schemas';

// This is a mongodb collection class

// In milliseconds
const AI_WAIT_INTERVAL = 1000;

const EASY_AI_INT_DIFF = parseInt(process.env.EASY_AI_INT_DIFF || '100', 10);

const sleepMs = async (ms: number) => new Promise((res) => setTimeout(res, ms));

class SlapJackGameService {
  private gameJobs: Record<
    string,
    {
      gameInfo: SlapJackGameType;
      socketId: string;
    }
  > = {};

  public getNextCard(gameId: string, userId?: string) {
    const { gameInfo } = this.gameJobs[gameId];
    if (
      gameInfo.gameConfig.mode !== SlapJackGameMode.AI &&
      (!userId || gameInfo[`player${gameInfo.turn}Id`]?.toString() !== userId)
    ) {
      return { error: 'It is not your turn.' };
    }
    if (
      gameInfo.gameConfig.mode === SlapJackGameMode.AI &&
      gameInfo.turn !== '1'
    ) {
      return { error: 'It is not your turn.' };
    }

    const [selected, ...rest] = gameInfo[
      `player${gameInfo.turn}CardSet`
    ] as SlapJackGameType['player1CardSet'];
    gameInfo[`player${gameInfo.turn}CardSet`] = rest;
    gameInfo.playedCardSet = [selected, ...gameInfo.playedCardSet];
    gameInfo.turn = gameInfo.turn === '1' ? '2' : '1';

    return {
      result: {
        cards: rest.length,
        playedCard: selected,
      },
      withAI: gameInfo.gameConfig.mode === SlapJackGameMode.AI,
    };
  }

  public async getNextCardAI(gameId: string) {
    const plusMinus = Math.random() > 0.5 ? -1 : 1;
    const diff = Math.ceil(Math.random() * EASY_AI_INT_DIFF);
    await sleepMs(AI_WAIT_INTERVAL + plusMinus * diff);

    const { gameInfo } = this.gameJobs[gameId];
    if (
      gameInfo.gameConfig.mode !== SlapJackGameMode.AI ||
      gameInfo.turn !== '2'
    ) {
      return { error: "It is not AI's turn." };
    }

    const [selected, ...rest] = gameInfo.player2CardSet;
    gameInfo.player2CardSet = rest;
    gameInfo.playedCardSet = [selected, ...gameInfo.playedCardSet];
    gameInfo.turn = '1';
    return {
      result: {
        cards: gameInfo.player1CardSet.length,
        playedCard: selected,
        turnChange: true,
      },
    };
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
    };
  }
}

export default new SlapJackGameService();
