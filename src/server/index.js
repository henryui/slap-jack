// Shouldn't need to change this file
import 'dotenv/config';
import express from 'express';
import expressLoader from './expressLoader';
import MongoServer from './MongoServer';
import Repository from './Repository';
import { SlapJackGameService, SocketService } from './services';

(async () => {
  try {
    console.log(`------- Starting Server -------`);

    const uri = await MongoServer.create(7000);

    const app = express();
    await Repository.connect(uri);

    expressLoader(app);

    const server = app.listen(process.env.PORT || 8000, () =>
      console.log(`Listening on port ${process.env.PORT || 8000}!`),
    );
    SocketService.createSocket(server);
    SlapJackGameService.startCleanupCron();
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
