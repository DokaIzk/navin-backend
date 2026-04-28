import '../loadEnv.js';
import mongoose from 'mongoose';
import { generateApiKey } from '../modules/auth/apiKey.service.js';
import { config } from '../config/index.js';
import { logger } from '../shared/logger/logger.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    logger.error('Usage: npm run generate-api-key <name> <organizationId> [shipmentId]');
    logger.error('Example: npm run generate-api-key "IoT Sensor 1" 507f1f77bcf86cd799439011');
    process.exit(1);
  }

  const [name, organizationId, shipmentId] = args;

  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    const result = await generateApiKey({
      name,
      organizationId,
      shipmentId,
    });

    logger.info({ apiKeyId: result.id }, 'API key generated successfully');
    logger.info('IMPORTANT: Save this API key securely - it will not be shown again');
    logger.info({ apiKey: result.apiKey });
    logger.info({ id: result.id, name: result.name, organizationId: result.organizationId });
    if (result.shipmentId) {
      logger.info({ shipmentId: result.shipmentId });
    }
    logger.info({ createdAt: result.createdAt.toISOString() });
    logger.info('Usage: Include this header in your IoT webhook requests');
    logger.info({ header: `x-api-key: ${result.apiKey}` });
  } catch (error) {
    logger.error({ err: error }, 'Error generating API key');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
