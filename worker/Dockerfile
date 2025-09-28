FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm i --production
COPY . .
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node","index.mjs"]
