// import { Router } from 'express';
// import UserService from './services/UserService';
// import SlapJackGameService from './services/SlapJackGameService';
// import { GameDifficulty, SlapJackGameMode } from '../../types';

// const router = Router();

// router.get('/user/get_current_user', async (req, res) => {
//   // TODO: Change this to use req.user.id -> to get current user after user auth impl
//   const userInfo = await UserService.fetchRandomUser();
//   return res.json(userInfo);
// });

// router.get('/user/:userId', async (req, res) => {
//   const userInfo = await UserService.findById(req.params.userId);
//   return res.json(userInfo);
// });

// router.get('/slap_jack_game', async (req, res) => {
//   const randomUser = await UserService.fetchRandomUser();
//   const gameInfo = await SlapJackGameService.startGame({
//     player1Id: randomUser!._id.toString(),
//     gameConfig: {
//       mode: SlapJackGameMode.AI,
//       // Only exists with AI mode.
//       difficulty: GameDifficulty.Easy,
//       pair: true,
//       oneBetweenPair: true,
//       sequence: true,
//       alphaCardRules: true,
//     },
//     socketId: req.query.socketId as string,
//   });
//   return res.json(gameInfo);
// });

// router.delete('/slap_jack_game/:gameId', async (req, res) => {
//   const { gameId } = req.params;
//   await SlapJackGameService.deleteGame(gameId);
//   return res.json();
// });

// module.exports = router;

import { ErrorRequestHandler, RequestHandler, Router } from 'express';
import { SlapJackGameRoute, UserRoute } from './routers';

export const router = Router();

type Method = 'get' | 'post' | 'put' | 'delete';

const handleRoutes = () => {
  [SlapJackGameRoute, UserRoute].map((routeMap) =>
    Object.entries(routeMap).forEach(([route, handlers]) => {
      const [httpMethod, uri] = route.split(' ') as [Method, string];

      const processRoute = handlers.map((fn: any) => (...args: any[]) => {
        const [, _res, next] = args;
        const returnee = fn(...args);
        return typeof returnee?.catch === 'function'
          ? returnee.catch((err: Error) => {
              next(err);
            })
          : returnee;
      }) as RequestHandler[];

      router[httpMethod](uri, processRoute);
    }),
  );
};

handleRoutes();

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  return res.status(500).send(err);
};
