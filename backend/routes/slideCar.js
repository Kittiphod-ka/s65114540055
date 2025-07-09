const express = require("express");
const router = express.Router();
const SlideCar = require("../models/SlideCar");
const mongoose = require("mongoose");

// ✅ ดึงข้อมูลรถสไลด์ทั้งหมด
router.get("/", async (req, res) => {
    try {
        const slideCars = await SlideCar.find().populate("driver", "username phone"); // ✅ ต้องเป็น SlideCar เท่านั้น
        
        console.log("🚗 SlideCars Data:", slideCars); // ✅ LOG เช็คค่าที่ถูกต้อง
        res.json(slideCars);
    } catch (error) {
        console.error("❌ Error fetching slide cars:", error);
        res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลรถสไลด์ได้!" });
    }
});

router.post("/", async (req, res) => {
    try {
      const { brand, model, licensePlate, driver, status } = req.body;
  
      // ตรวจสอบว่าข้อมูลที่ส่งมาครบหรือไม่
      if (!brand || !model || !licensePlate || !status) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      }
  
      const newSlideCar = new SlideCar({
        brand,
        model,
        licensePlate,
        driver: driver || null,
        status,
      });
  
      await newSlideCar.save();
      res.status(201).json({ message: "🚗 เพิ่มรถสไลด์สำเร็จ!", slideCar: newSlideCar });
    } catch (error) {
      console.error("❌ Error adding slide car:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มรถสไลด์", error });
    }
  });

// ✅ อัปเดตสถานะของรถสไลด์
router.put("/update-status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "❌ รหัสรถสไลด์ไม่ถูกต้อง" });
      }
  
      const slideCar = await SlideCar.findByIdAndUpdate(id, { status }, { new: true });
  
      if (!slideCar) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลรถสไลด์!" });
      }
  
      res.json(slideCar);
    } catch (error) {
      console.error("❌ Error updating status:", error);
      res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้!" });
    }
  });

// ✅ กำหนดคนขับให้รถสไลด์
router.put("/driver/:id", async (req, res) => {
  try {
    const { driverId } = req.body;
    const slideCar = await SlideCar.findById(req.params.id);
    if (!slideCar) {
      return res.status(404).json({ message: "ไม่พบรถสไลด์" });
    }

    slideCar.driver = driverId;
    await slideCar.save();
    res.json({ message: "✅ กำหนดคนขับสำเร็จ", slideCar });
  } catch (error) {
    console.error("❌ Error assigning driver:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ลบรถสไลด์
router.delete("/:id", async (req, res) => {
  try {
    const slideCar = await SlideCar.findByIdAndDelete(req.params.id);
    if (!slideCar) {
      return res.status(404).json({ message: "ไม่พบรถสไลด์" });
    }
    res.json({ message: "✅ ลบรถสไลด์สำเร็จ" });
  } catch (error) {
    console.error("❌ Error deleting slide car:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ อัปเดตข้อมูลรถสไลด์
router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "❌ รหัสรถสไลด์ไม่ถูกต้อง" });
      }
  
      const { brand, model, licensePlate, driver, status } = req.body;
      const updateData = { brand, model, licensePlate, status };
  
      if (driver && mongoose.Types.ObjectId.isValid(driver)) {
        updateData.driver = new mongoose.Types.ObjectId(driver);
      } else {
        updateData.driver = null;
      }
  
      const updatedSlideCar = await SlideCar.findByIdAndUpdate(id, updateData, { new: true });
  
      if (!updatedSlideCar) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลรถสไลด์!" });
      }
  
      res.json({ message: "🚗 อัปเดตรถสไลด์สำเร็จ!", updatedSlideCar });
    } catch (error) {
      console.error("❌ Error updating slide car:", error);
      res.status(500).json({ message: "❌ ไม่สามารถอัปเดตรถสไลด์ได้!" });
    }
  });


  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "❌ รหัสรถสไลด์ไม่ถูกต้อง" });
      }
  
      const slideCar = await SlideCar.findById(id).populate("driver", "username phone");
      if (!slideCar) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลรถสไลด์" });
      }
  
      res.json(slideCar);
    } catch (error) {
      console.error("❌ Error fetching slide car:", error);
      res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้!" });
    }
  });
  


module.exports = router;
