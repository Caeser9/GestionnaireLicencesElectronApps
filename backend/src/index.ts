import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config';
import logger from './utils/logger';

async function bootstrap() {
  await connectDatabase();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, {
      env: config.env,
      url: config.apiBaseUrl,
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
