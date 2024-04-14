// Shouldn't need to change this file
import express from 'express';
import expressLoader from './expressLoader';
import MongoServer from './MongoServer';
import Repository from './Repository';

(async () => {
  try {
    console.log(`------- Starting Server -------`);

    const uri = await MongoServer.create(7000);

    const app = express();
    await Repository.connect(uri);

    expressLoader(app);

    app.listen(8000, () => console.log(`Listening on port ${8000}!`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
