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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/slidecars', slideCarRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/admins", adminRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/booking-images", bookingImageRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 30055;

(async () => {
  await connectDB();
  await sequelize.sync(); // dev: ใช้ { alter: true } ชั่วคราวได้
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})();
