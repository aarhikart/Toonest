FROM node:20-alpine AS base
WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5001

VOLUME ["/app/sessions"]

CMD ["npm", "start"]
