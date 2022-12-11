export const config = {
  self: {
    port: process.env.PORT,
    serviceName: process.env.SERVICE_NAME,
    serviceHost: process.env.SERVICE_HOST,
    basePath: process.env.BASE_PATH,
    queue: process.env.RABBITMQ_QUEUE,
    jwtSecret: process.env.JWT_SECRET,
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
};
