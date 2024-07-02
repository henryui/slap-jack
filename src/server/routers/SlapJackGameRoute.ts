import { RequestHandler } from 'express';
import { SlapJackGameService, UserService } from '../services';
import { GameDifficulty, SlapJackGameMode } from '../../../types';

const createGame: RequestHandler = async (req, res) => {
  const randomUser = await UserService.fetchRandomUser();
  const gameInfo = await SlapJackGameService.startGame({
    player1Id: randomUser!._id.toString(),
    gameConfig: {
      mode: SlapJackGameMode.AI,
      // Only exists with AI mode.
      difficulty: GameDifficulty.Easy,
      pair: true,
      oneBetweenPair: true,
      sequence: true,
      alphaCardRules: true,
    },
    socketId: req.query.socketId as string,
  });
  return res.json(gameInfo);
};

const deleteGame: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  await SlapJackGameService.deleteGame(gameId);
  return res.json();
};

// TODO: Add middlewares for policy guarding
export default {
  'get /slap_jack_game': [createGame],

  'delete /slap_jack_game/:gameId': [deleteGame],
};
