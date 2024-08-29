import { RequestHandler } from 'express';
import { MafiaGameService } from '../services';

const createGame: RequestHandler = async (req, res) => {
  const { mcUser, socketId } = req.body;
  const roomId = await MafiaGameService.createGame(mcUser, socketId);
  return res.json({ roomId });
};

const leaveGame: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  const { localStorageId, onVote } = req.body;
  await MafiaGameService.leaveGame(
    gameId,
    localStorageId,
    undefined,
    onVote ? true : undefined,
  );
  return res.json();
};

const joinGame: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  const { localStorageId, userName, socketId } = req.body;
  // state, users, role
  const result = await MafiaGameService.joinGame(gameId, socketId, {
    localStorageId,
    userName,
  });
  return res.json(result);
};

const startGame: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  const { gameConfig } = req.body;
  await MafiaGameService.startGame(gameId, gameConfig);
  return res.json();
};

const endDay: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  await MafiaGameService.endDay(gameId);
  return res.json();
};

const updatePick: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  const { localStorageId, pickedId, turn } = req.body;
  await MafiaGameService.updatePick(gameId, localStorageId, pickedId, turn);
  return res.json();
};

// TODO: Add middlewares for policy guarding
export default {
  'post /mafia_game': [createGame],

  'post /mafia_game/:gameId/leave': [leaveGame],

  'post /mafia_game/:gameId/join': [joinGame],

  'post /mafia_game/:gameId/start': [startGame],

  'post /mafia_game/:gameId/end_day': [endDay],

  'post /mafia_game/:gameId/pick': [updatePick],
};
