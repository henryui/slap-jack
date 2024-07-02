import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler, router } from './router';

const expressLoader = (app: Express) => {
  app.use(express.static('dist'));

  app.use(express.json());

  app.use(cors());

  app.use('/api', router);

  // error handler
  app.use(errorHandler);
};

export default expressLoader;
