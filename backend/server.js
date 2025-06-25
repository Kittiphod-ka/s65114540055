// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require("./routes/user");
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeWebhook = require('./webhooks/stripeWebhook');
const driverRoutes = require("./routes/driver");
const slideCarRoutes = require("./routes/slideCar");
const path = require("path");
const router = express.Router();

const dotenv = require('dotenv');

dotenv.config();

const app = express();

// เชื่อมต่อ MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', userRoutes);
console.log('Routes loaded successfully');
app.use('/api/users', userRoutes); // ใช้ userRoutes สำหรับผู้ใช้ทั้งหมด
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stripe', stripeWebhook);
app.use("/api", require("./routes/driver")); // ✅ ให้แน่ใจว่าเชื่อม `/routes/driver.js`
app.use("/api/drivers", driverRoutes);
app.use("/api/slidecars", slideCarRoutes);
console.log("✅ SlideCar Routes Loaded");  // ✅ เพิ่ม Route สำหรับรถสไลด์

const adminRoutes = require("./routes/admin"); // ✅ ต้องมี
app.use("/api/admin", adminRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// ✅ ให้ Express ให้บริการไฟล์ในโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "public")));

// ✅ เพิ่ม Route ให้เข้าถึง `payment-success.html`
app.get("/payment-success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment-success.html"));
});





router.get("/payment-success", (req, res) => {
  const bookingId = req.query.bookingId;

  if (!bookingId) {
    console.error("❌ ไม่พบ Booking ID ใน URL");
    return res.status(400).send("❌ ไม่พบ Booking ID");
  }

  // ✅ ใช้ Deep Linking กลับเข้าแอป
  const deepLink = `myapp://payment-success?bookingId=${bookingId}`;
  console.log(`📢 Redirecting to: ${deepLink}`);

  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${deepLink}" />
      </head>
      <body>
        <p>กำลังเปิดแอป...</p>
        <script>
          window.location.href = "${deepLink}";
        </script>
      </body>
    </html>
  `);
});

// ✅ เพิ่ม Route ของ Orders
const orderRoutes = require("./routes/orders");
app.use("/api/orders", orderRoutes); // 🛠️ ใช้ API `/api/orders/:user_id`

// ✅ เพิ่ม Route ของ booking-images
const bookingImageRoutes = require("./routes/bookingImageRoutes");
app.use("/api/booking-images", bookingImageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path, stat) => {
    res.set("Access-Control-Allow-Origin", "*"); // ✅ อนุญาตให้ React Native โหลดรูป
    res.set("Content-Type", "image/jpeg"); // ✅ ระบุประเภทไฟล์
  }
}));



module.exports = router;

