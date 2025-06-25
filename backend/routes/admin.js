const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ดึงข้อมูล Admin ทั้งหมด
router.get("/", authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find(); // ✅ ดึง Admin ทั้งหมด
    res.json(admins);
  } catch (error) {
    console.error("❌ Error fetching admin data:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูล Admin ได้" });
  }
});

module.exports = router;
