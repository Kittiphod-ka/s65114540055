const express = require("express");
const router = express.Router();
const { Driver, Booking, SlideCar } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ดึงคนขับทั้งหมด (ต้อง login)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [["id", "ASC"]] });
    res.json(drivers);
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 ดึง "งานทั้งหมด" ที่รอคนขับรับ
router.get("/driver/orders", async (req, res) => {
  try {
    const orders = await Booking.findAll({ where: { status: "รอคนขับ" } });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching driver orders:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// 📌 คนขับกดรับงาน
router.post("/driver/accept-order", async (req, res) => {
  const { order_id, driver_id } = req.body;
  try {
    const order = await Booking.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "ไม่พบงานนี้" });

    order.status = "กำลังดำเนินการ";
    order.driver_id = driver_id;
    await order.save();

    res.json({ message: "รับงานสำเร็จ!", order });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตงาน" });
  }
});

// ✅ ดึงสถานะของคนขับ
router.get("/status/:driverId", async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.driverId);
    if (!driver) return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ" });

    res.json({ status: driver.status });
  } catch (error) {
    console.error("❌ Error fetching driver status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลสถานะได้" });
  }
});

// ✅ อัปเดตสถานะของคนขับ
router.post("/update-status", async (req, res) => {
  try {
    const { driver_id, status } = req.body;
    const driver = await Driver.findByPk(driver_id);
    if (!driver) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ" });
    }
    driver.status = status;
    await driver.save();
    res.json({ message: "✅ อัปเดตสถานะสำเร็จ", status: driver.status });
  } catch (error) {
    console.error("❌ Error updating driver status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้" });
  }
});

// ✅ ดึงรายชื่อคนขับทั้งหมด
router.get("/all", async (req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [["id", "ASC"]] });
    res.json(drivers);
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้!" });
  }
});

// ✅ เพิ่มคนขับใหม่
router.post("/", async (req, res) => {
  try {
    const { username, name, password, phone, status } = req.body;
    const newDriver = await Driver.create({ username, name, password, phone, status });
    res.status(201).json({ message: "✅ เพิ่มคนขับสำเร็จ!", newDriver });
  } catch (error) {
    console.error("❌ Error adding driver:", error);
    res.status(500).json({ message: "❌ เพิ่มคนขับไม่สำเร็จ!" });
  }
});

// ✅ ตรวจสอบว่าค่า ID ถูกต้องก่อนค้นหา
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ!" });
    }
    res.json(driver);
  } catch (error) {
    console.error("❌ Error fetching driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้!" });
  }
});

// ✅ อัปเดตข้อมูลคนขับ
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ!" });
    }
    driver.name = name;
    driver.phone = phone;
    driver.status = status;
    await driver.save();
    res.json({ message: "✅ อัปเดตข้อมูลคนขับสำเร็จ!", driver });
  } catch (error) {
    console.error("❌ Error updating driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตข้อมูลได้!" });
  }
});

// ✅ อัปเดตสถานะรถสไลด์ของคันที่ระบุ
router.put("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const slideCar = await SlideCar.findByPk(id);
    if (!slideCar) return res.status(404).json({ message: "❌ ไม่พบข้อมูลรถสไลด์!" });
    slideCar.status = status;
    await slideCar.save();
    res.json(slideCar);
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้!" });
  }
});

module.exports = router;