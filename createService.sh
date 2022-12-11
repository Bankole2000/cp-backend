#!/usr/bin/env sh
# abort on errors
set -e

echo "Creating $1 service"
cd packages
mkdir "cp-$1-service"
cd "cp-$1-service"
npm init -y
npm i @cribplug/common
npm i express ts-node-dev typescript zod cors prisma @prisma/client axios
npm i -D @types/cors @types/express
npx prisma init
tsc --init
mkdir src
cd src
touch index.ts
touch app.ts
mkdir @types
cd @types
mkdir express
touch express/index.d.ts
cd ..
mkdir controllers
mkdir middleware
mkdir routes
mkdir services
mkdir schema
mkdir utils
touch utils/config.ts
touch middleware/logRequests.ts
touch middleware/validateRequest.ts
touch middleware/errorHandler.ts
touch routes/index.routes.ts
touch routes/data.routes.ts
touch routes/test.routes.ts
touch controllers/data.controllers.ts
touch controllers/test.controllers.ts
touch services/events.service.ts
touch services/request.service.ts
cd ..
touch .dockerignore
touch .gitignore
touch Dockerfile
cd ../../
