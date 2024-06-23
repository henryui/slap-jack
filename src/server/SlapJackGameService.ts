import {
  CardNumber,
  CardShape,
  PlayingCardType,
  SlapJackGameConfig,
  SlapJackGameMode,
} from '../../types';
import { ObjectId, SlapJackGame } from './schemas';

// This is a mongodb collection class

class SlapJackGameService {
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
  }) {
    const { player1Id, player2Id, gameConfig } = options;
    // Validate GameConfig for proper game creation
    this.validateGameConfig(gameConfig, player2Id);

    const newDeck = this.createShuffledDeck();
    const player1CardSet = newDeck.slice(0, newDeck.length / 2);
    const player2CardSet = newDeck.slice(newDeck.length / 2);

    return await SlapJackGame.create({
      turn: Math.random() > 0.5 ? '1' : '2',
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
  }
}

export default new SlapJackGameService();
