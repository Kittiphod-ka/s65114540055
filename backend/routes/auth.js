const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const Driver = require("../models/driver");
// const Admin = require("../models/admin");

dotenv.config();
const router = express.Router();

// ✅ ฟังก์ชันเช็ค Role ของ User, Driver หรือ Admin
const findUserOrDriverOrAdmin = async (username) => {
  let admin = await User.findOne({ username });
  if (admin) return { user: admin, role: "admin" };

  let user = await User.findOne({ username });
  if (user) return { user, role: "user" };

  let driver = await Driver.findOne({ username });
  if (driver) return { user: driver, role: "driver" };

  return null;
};

// // ✅ สมัคร Admin ใหม่
// router.post("/admin/signup", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     let admin = await Admin.findOne({ email });
//     if (admin) {
//       return res.status(400).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
//     }

//     const newAdmin = new Admin({ username, email, password });
//     await newAdmin.save();

//     res.status(201).json({ message: "สร้างแอดมินสำเร็จ" });
//   } catch (error) {
//     console.error("❌ Error creating admin:", error);
//     res.status(500).json({ message: "เกิดข้อผิดพลาด" });
//   }
// });

// ✅ ล็อกอิน (แยก Role)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'ล็อกอินสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Error logging in:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// ✅ Middleware เช็ค Role ก่อนเข้า Admin Dashboard
const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

// ✅ Route Admin Dashboard
router.get("/admin-dashboard", adminAuthMiddleware, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard", user: req.user });
});

// ✅ สมัคร User ใหม่
router.post("/signup", async (req, res) => {
  const { username, email, phone, password, profile, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      profile: profile || '',
      role: role || 'user',
    });

    await newUser.save();

    res.status(201).json({ message: "สร้างบัญชีผู้ใช้สำเร็จ" });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});


module.exports = router;
