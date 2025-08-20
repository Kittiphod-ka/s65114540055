const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ดึงข้อมูล Admin ทั้งหมด (role = 'admin')
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: "admin" },
      order: [["id", "ASC"]],
      attributes: ["id", "username", "email", "phone", "role", "createdAt", "updatedAt"],
    });
    res.json(admins);
  } catch (error) {
    console.error("❌ Error fetching admin data:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูล Admin ได้" });
  }
});

module.exports = router;
