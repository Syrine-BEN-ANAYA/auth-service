# -------- BUILD --------
FROM node:20-bullseye-slim
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# -------- PRODUCTION --------
FROM node:20-alpine

WORKDIR /app

# UPDATE sécurisé du système
RUN apk update && apk upgrade

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

COPY .env .env

EXPOSE 3001

CMD ["node", "dist/main.js"]