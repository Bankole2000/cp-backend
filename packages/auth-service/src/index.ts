import {
  rabbitMQConnect, redisConnect, RedisConnection, serviceDown, serviceUp, setIO
} from '@cribplug/common';
import http from 'http';
import { app } from './app';
import { config } from './utils/config';
import routes from './routes/index.routes';
import { serviceEvents } from './services/events.service';

const { self, rabbitMQConfig, redisConfig } = config;
const PORT = self.port;

const httpServer = http.createServer(app);

const io = setIO(httpServer, `${self.basePath}/socket`);

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
  }
  await serviceEvents(channel);
  await serviceUp(redis, config);
  routes(app);
  // ['SIGTERM', 'SIGINT', 'SIGKILL', 'uncaughtException', 'unhandledRejection'].forEach((signal) => {
  //   process.on(signal, async () => {
  //     await serviceDown(redis, config);
  //     process.exitCode = 1;
  //   });
  // });
  console.log(`${self.emoji} ${self.serviceName?.toUpperCase()} Listening on port ${PORT}!!!!!`);
});
