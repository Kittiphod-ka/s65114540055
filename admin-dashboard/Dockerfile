# admin-dashboard/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .



# บอก Docker ว่า container นี้ใช้พอร์ต 3000
EXPOSE 10055
CMD ["npm","run", "dev"]
