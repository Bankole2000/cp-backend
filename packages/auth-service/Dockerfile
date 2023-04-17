FROM node:16-slim as base

RUN apt-get update
RUN apt-get install -y openssl

FROM base as dev

WORKDIR /app

COPY package.json .
COPY tsconfig.json .

RUN npm install

COPY . .

EXPOSE 7700

RUN npx prisma generate

CMD [ "npm", "run", "dev" ]