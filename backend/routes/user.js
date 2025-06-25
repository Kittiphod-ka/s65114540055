// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware"); // ใช้สำหรับป้องกัน Route
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Middleware ตรวจสอบ Admin Role
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
// ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ Admin เท่านั้น)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้" });
    }

    const users = await User.find({}, "-password"); // ❌ ไม่ส่ง password กลับ
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ดึงข้อมูลผู้ใช้ตาม ID
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// อัปเดตข้อมูลผู้ใช้
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ลบผู้ใช้
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "❌ ID ไม่ถูกต้อง!" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลผู้ใช้!" });
    }

    res.json({ message: "✅ ลบผู้ใช้สำเร็จ!" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "❌ ไม่สามารถลบผู้ใช้ได้!" });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // ดึงข้อมูลเฉพาะผู้ใช้ที่ทำการร้องขอ
    const user = await User.findById(req.user.id).select('-password'); // ไม่ดึงรหัสผ่าน
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user); // ส่งข้อมูลผู้ใช้กลับไป
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
