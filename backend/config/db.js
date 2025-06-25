const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // ใช้ตัวแปรจากไฟล์ .env
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car';

    await mongoose.connect(mongoURI); // ลบ useNewUrlParser และ useUnifiedTopology

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // ออกจากโปรเซสทันทีหากไม่สามารถเชื่อมต่อได้
  }
};

module.exports = connectDB;
