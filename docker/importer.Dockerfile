FROM node:18-alpine

WORKDIR /app

# ติดตั้ง dependencies จาก package.json ที่ root
COPY package.json package-lock.json ./
RUN npm install

# Copy สคริปต์ import
COPY docker/mongo_to_postgres_import.js ./

# Copy backend models และ config ที่ต้องใช้
COPY backend ./backend

# mongo-backup จะ mount จาก host

CMD ["node", "mongo_to_postgres_import.js", "--dir", "./mongo-backup", "--sync"]