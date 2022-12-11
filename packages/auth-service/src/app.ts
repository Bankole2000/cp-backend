import express, { Express } from 'express';
import * as useragent from 'express-useragent';
import cors from 'cors';
import { logRequest } from './middleware/logRequests';
import { getUserIfLoggedIn } from './middleware/requireUser';
// import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

app.use(express.json());
app.use(useragent.express());
app.use(cors());
app.use(logRequest);
app.use(getUserIfLoggedIn);
// app.use(errorHandler);

// eslint-disable-next-line import/prefer-default-export
export { app };
