# api/Dockerfile  (context = ./api)
FROM node:20-alpine
WORKDIR /app

# 1️⃣ copy only manifests first (for layer-cache)
COPY package*.json ./

RUN npm ci

# 2️⃣ then copy the rest of the source
COPY . .

RUN npm run build && npm prune --omit=dev
CMD ["node", "dist/app.js"]