FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 19000 19001 19002

# ใช้ npx expo start แทนการเรียก expo-cli global
CMD ["npx", "expo", "start", "--tunnel"]