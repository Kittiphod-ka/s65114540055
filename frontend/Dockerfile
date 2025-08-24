FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 40055

# ใช้ npx expo start แทนการเรียก expo-cli global
CMD ["npx", "expo", "start", "--tunnel"]