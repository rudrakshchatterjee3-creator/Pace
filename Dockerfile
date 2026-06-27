# Dockerfile — single image for Google Cloud Run.
# Builds the Vite SPA and runs the Express server that serves it + proxies Gemini.
FROM node:20-slim

WORKDIR /app

# Install deps first for better layer caching.
COPY package*.json ./
RUN npm ci

# Copy source and build the client bundle into /app/dist.
COPY . .
RUN npm run build

# Cloud Run sets PORT (default 8080); the server reads process.env.PORT.
ENV NODE_ENV=production
EXPOSE 8080

# package.json should define:  "start": "tsx server/index.ts"
CMD ["npm", "run", "start"]
