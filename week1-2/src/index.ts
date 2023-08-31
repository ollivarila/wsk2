import app from './app';
import config from './config';

app.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${config.port}`);
});
