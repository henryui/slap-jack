import { Router } from 'express';
import UserService from './UserService';
import SlapJackGameService from './SlapJackGameService';
import { GameDifficulty, SlapJackGameMode } from '../../types';

const router = Router();

router.get('/user/:userId', async (req, res) => {
  const userInfo = await UserService.findById(req.params.userId);
  return res.json(userInfo);
});

router.get('/slap_jack_game', async (req, res) => {
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
});

module.exports = router;
