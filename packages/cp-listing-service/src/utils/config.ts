export const config = {
  self: {
    port: process.env.PORT,
    serviceName: process.env.SERVICE_NAME,
    serviceHost: process.env.SERVICE_HOST,
    basePath: process.env.BASE_PATH,
    queue: process.env.RABBITMQ_QUEUE,
    jwtSecret: process.env.JWT_SECRET,
    emoji: process.env.EMOJI,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL,
    accessTokenTTLMS: process.env.ACCESS_TOKEN_TTL_MS,
    env: process.env.ENVIRONMENT
  },
  redisConfig: {
    url: process.env.REDIS_CACHE_URL,
    scope: process.env.REDIS_PUBSUB_SCOPE,
    // pubsubURL: process.env. '',
  },
  rabbitMQConfig: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EX,
    exqueue: process.env.RABBITMQ_X_QUEUE
  },
  pocketbase: {
    url: process.env.POCKETBASE_URL,
    adminEmail: process.env.PB_ADMIN_EMAIL,
    adminPassword: process.env.PB_ADMIN_PASSWORD,
  }
};
