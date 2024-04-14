// Shouldn't need to change this file
import express, { Express } from 'express';

const expressLoader = (app: Express) => {
  const cors = require('cors');
  const router = require('./router');

  app.use(express.static('dist'));

  app.use(express.json());

  app.use(cors());

  app.use('/api', router);
};

export default expressLoader;
