/* eslint-disable node/no-extraneous-import */
require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {notFound, errorHandler} from './middlewares';
import createServerMiddleware from './api/apolloServer';
import fileRouter from './api/routes/fileRouter';

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(cors<cors.CorsRequest>());
app.use(express.json());

(async () => {
  const serverMiddleware = await createServerMiddleware();
  app.use('/graphql', serverMiddleware);
  app.use('/upload', fileRouter);
  app.use(notFound);
  app.use(errorHandler);
})();

export default app;
