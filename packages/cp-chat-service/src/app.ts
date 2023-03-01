import express, { Express } from 'express';
import * as useragent from 'express-useragent';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { logRequest } from './middleware/logRequests';
// import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

app.use(express.json());
app.use(useragent.express());
app.use(cookieParser());
app.use(cors());
app.use(logRequest);
// app.use(errorHandler);

// eslint-disable-next-line import/prefer-default-export
export { app };
