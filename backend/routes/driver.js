const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking"); // ✅ ตรวจสอบว่าไฟล์ `booking.js` ถูกต้อง
const Driver = require("../models/driver");
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/authMiddleware"); 
const mongoose = require("mongoose");
const SlideCar = require("../models/SlideCar");



// ✅ เพิ่ม authMiddleware เพื่อเช็คสิทธิ์ก่อนดึงข้อมูล
router.get("/", authMiddleware, async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    res.status(500).json({ message: "Server error" });
  }
});




// 📌 ✅ ดึง "งานทั้งหมด" ที่รอคนขับรับ
router.get("/driver/orders", async (req, res) => {
  try {
    const orders = await Booking.find({ status: "รอคนขับ" }); // ✅ ดึงงานที่ยังไม่มีคนรับ
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching driver orders:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// 📌 ✅ คนขับกดรับงาน
router.post("/driver/accept-order", async (req, res) => {
  const { order_id, driver_id } = req.body;
  try {
    const order = await Booking.findById(order_id);
    if (!order) return res.status(404).json({ message: "ไม่พบงานนี้" });

    order.status = "กำลังดำเนินการ"; // ✅ เปลี่ยนสถานะเป็น "กำลังดำเนินการ"
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
    const driver = await Driver.findById(req.params.driverId);
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

    console.log(`📡 อัปเดตสถานะของคนขับ: ${driver_id} -> ${status}`);

    const driver = await Driver.findOneAndUpdate(
      { _id: driver_id },  // ✅ ค้นหาคนขับจาก ID
      { status },          // ✅ อัปเดตเฉพาะ status เท่านั้น
      { new: true, runValidators: false } // ✅ ปิด validation ที่ไม่เกี่ยวข้อง
    );

    if (!driver) {
      console.log("❌ ไม่พบข้อมูลคนขับ");
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ" });
    }

    console.log("✅ อัปเดตสถานะสำเร็จ:", driver);
    res.json({ message: "✅ อัปเดตสถานะสำเร็จ", status: driver.status });

  } catch (error) {
    console.error("❌ Error updating driver status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้" });
  }
});

router.get("/api/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลคนขับได้" });
  }
});

router.get("/drivers/available", authenticateToken, async (req, res) => {
  try {
      const drivers = await Driver.find({ status: "on" });
      res.json(drivers);
  } catch (error) {
      res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลคนขับได้" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "❌ ไม่ได้รับอนุญาต (Invalid Token)" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "❌ Token ไม่ถูกต้อง" });
      req.user = user;
      next();
  });
}

// ✅ ดึงรายชื่อคนขับทั้งหมด
router.get("/all", async (req, res) => {
  try {
    const drivers = await Driver.find();
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
    const newDriver = new Driver({ username, name, password, phone, status });
    await newDriver.save();
    res.status(201).json({ message: "✅ เพิ่มคนขับสำเร็จ!", newDriver });
  } catch (error) {
    console.error("❌ Error adding driver:", error);
    res.status(500).json({ message: "❌ เพิ่มคนขับไม่สำเร็จ!" });
  }
});

// // // ✅ ตรวจสอบว่าค่า ID ถูกต้องก่อนค้นหา
router.get("/drivers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 รับค่า ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ ID ไม่ถูกต้อง:", id);
      return res.status(400).json({ message: "❌ ID ไม่ถูกต้อง!" });
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      console.log("❌ ไม่พบข้อมูลคนขับ:", id);
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ!" });
    }

    console.log("✅ พบข้อมูลคนขับ:", driver);
    res.json(driver);
  } catch (error) {
    console.error("❌ Error fetching driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้!" });
  }
});




router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "❌ ID ไม่ถูกต้อง!" });
    }

    const { name, phone, status } = req.body;
    const updatedDriver = await Driver.findByIdAndUpdate(id, { name, phone, status }, { new: true });

    if (!updatedDriver) {
      return res.status(404).json({ message: "❌ ไม่พบข้อมูลคนขับ!" });
    }

    res.json({ message: "✅ อัปเดตข้อมูลคนขับสำเร็จ!", updatedDriver });
  } catch (error) {
    console.error("❌ Error updating driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตข้อมูลได้!" });
  }
});

router.put("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ ข้ามการตรวจสอบ ObjectId เพราะอาจใช้ค่าที่ไม่ใช่ ObjectId
    const updatedCar = await SlideCar.findOneAndUpdate({ _id: id }, { status }, { new: true });

    if (!updatedCar) return res.status(404).json({ message: "❌ ไม่พบข้อมูลรถสไลด์!" });

    res.json(updatedCar);
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้!" });
  }
});

module.exports = router;
