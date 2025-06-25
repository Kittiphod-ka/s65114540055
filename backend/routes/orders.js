const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking"); 

// ✅ ดึงรายการ Booking ของผู้ใช้
router.get("/:user_id", async (req, res) => {
    try {
        const user_id = req.params.user_id;
        console.log("📢 กำลังดึงออเดอร์ของ user_id:", user_id);

        const orders = await Booking.find({ user_id });

        if (!orders.length) {
            return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อ" });
        }

        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ" });
    }
});

module.exports = router;
