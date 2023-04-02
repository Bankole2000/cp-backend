import {
  rabbitMQConnect, redisConnect, RedisConnection, serviceUp, setIO, serviceDown
} from '@cribplug/common';
import http from 'http';
import { app } from './app';
import { config } from './utils/config';
import routes from './routes/index.routes';
import { serviceEvents } from './services/events.service';
import { getUserIfLoggedIn } from './middleware/requireUser';
import { socketEvents } from './services/events/socketEventHandlers.service';
import { socketEventTypes } from './schema/socket.schema';
import { setShareAbles } from './utils/common';

const { self, rabbitMQConfig, redisConfig } = config;
const PORT = self.port;

const httpServer = http.createServer(app);

const io = setIO(httpServer, `${config.self.basePath}/socket`);

io.on('connection', (socket) => {
  console.log('Profile Socket client connected');
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  socket.on('USER_CONNECTED', async (data) => {
    await socketEvents[socketEventTypes.USER_CONNECTED](data, socket, io);
  });
  socket.on(socketEventTypes.TAGGABLE_PROFILES, async (data) => {
    await socketEvents[socketEventTypes.TAGGABLE_PROFILES](data, socket, io);
  });
  socket.on(socketEventTypes.GET_PROFILE_PREVIEW, async (data, callback) => {
    const result = await socketEvents[socketEventTypes.GET_PROFILE_PREVIEW](data, socket, io);
    callback(result);
  });
});

// const socketHeartbeat = () => {
//   setInterval(() => {
//     const number = Math.random();
//     console.log({ number });
//     io.emit('PULSE', number);
//   }, 2000);
// };

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
  // socketHeartbeat();
  console.log(`${self.emoji} ${config.self.serviceName?.toUpperCase()} Listening on port ${PORT}!!!!!`);
});
