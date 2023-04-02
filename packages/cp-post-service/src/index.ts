import {
  rabbitMQConnect, redisConnect, RedisConnection, serviceUp, setIO, serviceDown
} from '@cribplug/common';
import http from 'http';
import { app } from './app';
import { config } from './utils/config';
import routes from './routes/index.routes';
import { serviceEvents } from './services/events.service';
import { getUserIfLoggedIn } from './middleware/requireUser';
import { setShareAbles } from './utils/common';
import { socketEventTypes } from './schema/socket.schema';
import { socketEvents } from './services/events/socketEventHandlers';

const { self, rabbitMQConfig, redisConfig } = config;
const PORT = self.port;

const httpServer = http.createServer(app);

const io = setIO(httpServer, `${config.self.basePath}/socket`);

io.on('connection', (socket) => {
  console.log('Socket connected');
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  socket.on('USER_CONNECTED', async (data) => {
    await socketEvents[socketEventTypes.USER_CONNECTED](data, socket, io);
  });
  socket.on(socketEventTypes.SEARCH_TAGS, async (data) => {
    await socketEvents[socketEventTypes.SEARCH_TAGS](data, socket, io);
  });
  socket.on(socketEventTypes.POST_LIKED, async (data) => {
    await socketEvents[socketEventTypes.POST_LIKED](data, socket, io);
  });
  socket.on(socketEventTypes.POST_UNLIKED, async (data) => {
    await socketEvents[socketEventTypes.POST_UNLIKED](data, socket, io);
  });
  socket.on(socketEventTypes.GET_REPOST_COUNT, async (data) => {
    await socketEvents[socketEventTypes.GET_REPOST_COUNT](data, socket, io);
  });
  try {
    socket.on(socketEventTypes.POST_CONNECTED, async (data, callback) => {
      const result = await socketEvents[socketEventTypes.POST_CONNECTED](data, socket, io);
      console.log({ result });
      callback(result);
    });
  } catch (error: any) {
    console.log({ error });
  }
  socket.on(socketEventTypes.GET_NEW_COMMENT, async (data, callback) => {
    const result = await socketEvents[socketEventTypes.GET_NEW_COMMENT](data, socket, io);
    console.log({ result });
    callback(result);
  });
});

httpServer.listen(PORT, async () => {
  const { error, channel } = await rabbitMQConnect(
    rabbitMQConfig.url || '',
    self.queue || '',
    rabbitMQConfig.exchange || '',
    self.serviceName || '',
    `${self.emoji} 🐇`
  );
  const redis: RedisConnection = redisConnect(redisConfig.url || '', redisConfig.scope || '');
  if (channel && !error) {
    app.use((req, _, next) => {
      req.channel = channel;
      req.redis = redis;
      next();
    });
    app.use(getUserIfLoggedIn);
  }
  await serviceUp(redis, config);
  await serviceEvents(channel);
  setShareAbles(channel, redis);
  routes(app);
  ['SIGTERM', 'SIGINT', 'SIGKILL', 'uncaughtException', 'unhandledRejection'].forEach((signal) => {
    process.on(signal, async () => {
      await serviceDown(redis, config);
      process.exit(0);
    });
  });
  console.log(`${self.emoji} ${config.self.serviceName?.toUpperCase()} Listening on port ${PORT}!!!!!`);
});
