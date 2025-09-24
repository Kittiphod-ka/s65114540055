FROM node:20

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend ./

# copy users.json จาก postgresql-backup เข้าไปใน image
COPY postgressql-backup/users.json /app/backup/users.json
COPY postgressql-backup/drivers.json /app/backup/drivers.json
COPY postgressql-backup/slidecars.json /app/backup/slidecars.json
COPY postgressql-backup/bookings.json /app/backup/bookings.json


CMD ["npm", "run", "start-with-import"]
