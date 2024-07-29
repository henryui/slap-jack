import { RequestHandler } from 'express';
import { SlapJackGameService, UserService } from '../services';

const createGame: RequestHandler = async (req, res) => {
  const randomUser = await UserService.fetchRandomUser();
  const gameInfo = await SlapJackGameService.startGame({
    player1Id: randomUser!._id.toString(),
    gameConfig: req.body.config,
    socketId: req.body.socketId as string,
  });
  return res.json(gameInfo);
};

const forfeitGame: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  // TODO: Get user from logged in state
  const randomUser = await UserService.fetchRandomUser();
  const userId = randomUser!._id.toString();
  SlapJackGameService.forfeitGame(gameId, userId);
  return res.json();
};

// TODO: Add middlewares for policy guarding
export default {
  'post /slap_jack_game': [createGame],

  'post /slap_jack_game/forfeit/:gameId': [forfeitGame],
};
