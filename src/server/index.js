// Shouldn't need to change this file
import 'dotenv/config';
import express from 'express';
import expressLoader from './expressLoader';
import MongoServer from './MongoServer';
import Repository from './Repository';
import SocketService from './services/SocketService';

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
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
