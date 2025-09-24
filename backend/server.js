const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { connectDB, sequelize } = require('./config/db');
const { User, Driver, SlideCar, Booking, BookingImage } = require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bookingRoutes = require('./routes/booking');
const slideCarRoutes = require('./routes/slideCar');
const adminRoutes = require("./routes/admin");
const driverRoutes = require("./routes/driver");
const ordersRoutes = require("./routes/orders");
const bookingImageRoutes = require("./routes/bookingImageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const API_PREFIX = process.env.API_PREFIX || "";

app.use(`${API_PREFIX}/api/auth`, authRoutes);
app.use(`${API_PREFIX}/api/users`, userRoutes);
app.use(`${API_PREFIX}/api/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/api/slidecars`, slideCarRoutes);
app.use(`${API_PREFIX}/api/admins`, adminRoutes);
app.use(`${API_PREFIX}/api/drivers`, driverRoutes);
app.use(`${API_PREFIX}/api/orders`, ordersRoutes);
app.use(`${API_PREFIX}/api/booking-images`, bookingImageRoutes);
app.use(`${API_PREFIX}/api/payments`, paymentRoutes);


const PORT = process.env.PORT || 30055;

(async () => {
  await connectDB();
  await sequelize.sync(); // dev: ใช้ { alter: true } ชั่วคราวได้
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})();
