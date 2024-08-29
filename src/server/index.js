// Shouldn't need to change this file
import 'dotenv/config';
import express from 'express';
import expressLoader from './expressLoader';
import MongoServer from './MongoServer';
import Repository from './Repository';
import {
  MafiaGameService,
  SlapJackGameService,
  SocketService,
} from './services';

(async () => {
  try {
    console.log(`------- Starting Server -------`);

    const uri = await MongoServer.create(7000);

    const app = express();
    await Repository.connect(uri);

    expressLoader(app);

    const server = app.listen(8000, () =>
      console.log(`Listening on port ${8000}!`),
    );
    SocketService.createSocket(server);
    SlapJackGameService.startCleanupCron();

    // TODO: move this to test
    // MafiaGameService.assignRoles(
    //   { numMafias: 2, numCops: 2, numDoctors: 1 },
    //   Array(9)
    //     .fill(1)
    //     .map((_val, index) => ({
    //       localStorageId: index.toString(),
    //       userName: index.toString(),
    //       ...(index === 0 && { isMc: true }),
    //     })),
    // );
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
