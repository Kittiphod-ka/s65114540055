FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run dev

RUN npm install -g serve
CMD ["serve", "-s", "dev", "-l", "3000"]
