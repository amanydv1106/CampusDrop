FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

USER node

CMD ["node", "src/server.js"]
