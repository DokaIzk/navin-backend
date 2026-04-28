import './loadEnv.js';

import { createServer } from 'http';
import { buildApp } from './app.js';
import { config } from './config/index.js';
import { connectMongo } from './infra/mongo/connection.js';
import { initSocketIO } from './infra/socket/io.js';
import { startAlertWorker } from './workers/alert.worker.js';
import { logger } from './shared/logger/logger.js';

async function main() {
  await connectMongo(config.mongoUri);

  const app = buildApp();
  const httpServer = createServer(app);
  initSocketIO(httpServer);
  startAlertWorker();

  httpServer.listen(config.port, () => {
    logger.info({ port: config.port }, 'HTTP server listening');
  });
}

main().catch(err => {
  logger.error({ err }, 'Failed to start application');
  process.exit(1);
});
