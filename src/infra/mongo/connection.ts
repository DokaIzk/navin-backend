import mongoose from 'mongoose';
import { env } from '../../env.js';
import { logger } from '../../shared/logger/logger.js';

let testMongoServer: import('mongodb-memory-server').MongoMemoryServer | null = null;

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
} as const;

export async function connectMongo(mongoUri: string) {
  if (env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!testMongoServer) testMongoServer = await MongoMemoryServer.create();
    await mongoose.connect(testMongoServer.getUri(), MONGO_OPTIONS);
  } else {
    await mongoose.connect(mongoUri, MONGO_OPTIONS);
  }
  logger.info('MongoDB connected');
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  if (env.NODE_ENV === 'test' && testMongoServer) {
    await testMongoServer.stop();
    testMongoServer = null;
  }
}
