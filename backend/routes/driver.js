const express = require("express");
const router = express.Router();
const { Driver, SlideCar } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ดึงคนขับทั้งหมด
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [["id", "ASC"]] });
    res.json(drivers);
  } catch (error) {
    console.error("❌ Error fetching drivers:", error);
    res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลคนขับได้" });
  }
});

// ✅ สร้างคนขับ
router.post("/", authMiddleware, async (req, res) => {
  try {
    const d = await Driver.create(req.body);
    res.status(201).json(d);
  } catch (error) {
    console.error("❌ Error creating driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถสร้างคนขับได้" });
  }
});

// ✅ อัปเดตคนขับ
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const d = await Driver.findByPk(req.params.id);
    if (!d) return res.status(404).json({ message: "❌ ไม่พบคนขับ" });
    await d.update(req.body);
    res.json(d);
  } catch (error) {
    console.error("❌ Error updating driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตได้" });
  }
});

// ✅ ลบคนขับ
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const d = await Driver.findByPk(req.params.id);
    if (!d) return res.status(404).json({ message: "❌ ไม่พบคนขับ" });
    await d.destroy();
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error deleting driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถลบได้" });
  }
});

// ✅ อัปเดตสถานะของคนขับ (on/off)
router.post("/update-status", authMiddleware, async (req, res) => {
  try {
    const { driver_id, status } = req.body;
    if (!driver_id) return res.status(400).json({ message: "ต้องมี driver_id" });

    const d = await Driver.findByPk(driver_id);
    if (!d) return res.status(404).json({ message: "❌ ไม่พบคนขับ" });

    await d.update({ status });
    res.json(d);
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้" });
  }
});

// ✅ จัดคนขับให้รถสไลด์ (driverId → slide car)
router.post("/assign-car", authMiddleware, async (req, res) => {
  try {
    const { carId, driverId } = req.body;
    if (!carId) return res.status(400).json({ message: "ต้องมี carId" });

    const car = await SlideCar.findByPk(carId);
    if (!car) return res.status(404).json({ message: "❌ ไม่พบรถสไลด์" });

    await car.update({ driverId: driverId || null });
    res.json(car);
  } catch (error) {
    console.error("❌ Error assigning driver:", error);
    res.status(500).json({ message: "❌ ไม่สามารถจัดคนขับให้รถได้" });
  }
});

// ✅ อัปเดตสถานะรถสไลด์ของคันที่ระบุ (พร้อมใช้งาน/ไม่พร้อมใช้งาน)
router.patch("/slide-cars/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const car = await SlideCar.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "❌ ไม่พบรถสไลด์!" });

    await car.update({ status });
    res.json(car);
  } catch (error) {
    console.error("❌ Error updating car status:", error);
    res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้!" });
  }
});

module.exports = router;
