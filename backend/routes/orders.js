const express = require("express");
const router = express.Router();
const { Booking } = require("../models");

// ✅ ดึงรายการ Booking ของผู้ใช้
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Booking.findAll({
      where: { userId },
      order: [["id", "DESC"]],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อ" });
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ" });
  }
});

module.exports = router;
