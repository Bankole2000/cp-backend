import {
  rabbitMQConnect, redisConnect, RedisConnection, serviceUp, setIO, serviceDown
} from '@cribplug/common';
import http from 'http';
import { app } from './app';
import { config } from './utils/config';
import routes from './routes/index.routes';
import { serviceEvents } from './services/events.service';
import { getUserIfLoggedIn } from './middleware/requireUser';

const { self, rabbitMQConfig, redisConfig } = config;
const PORT = self.port;

const httpServer = http.createServer(app);

const io = setIO(httpServer, `${config.self.basePath}/socket`);

io.on('connection', (socket) => {
  console.log('Socket connected');
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
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
  routes(app);
  // ['SIGTERM', 'SIGINT', 'SIGKILL', 'uncaughtException', 'unhandledRejection'].forEach((signal) => {
  //   process.on(signal, async () => {
  //     await serviceDown(redis, config);
  //     process.exit(0);
  //   });
  // });
  console.log(`${self.emoji} ${config.self.serviceName?.toUpperCase()} Listening on port ${PORT}!!!!!`);
});
