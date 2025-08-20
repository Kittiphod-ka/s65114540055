const express = require("express");
const multer = require("multer");
const path = require("path");
const { BookingImage } = require("../models");

const router = express.Router();

// 📌 อัปโหลดไฟล์ไปยังโฟลเดอร์ uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const base = req.body.bookingId ? `booking-${req.body.bookingId}` : "booking-unknown";
    cb(null, `${base}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 📌 อัปโหลดรูป (single)
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "❌ ต้องระบุ bookingId" });
    if (!req.file) return res.status(400).json({ message: "❌ ไม่พบไฟล์ภาพ" });

    const imageUrl = `/uploads/${req.file.filename}`;
    const img = await BookingImage.create({ bookingId, imageUrl });
    res.status(201).json({ message: "✅ อัปโหลดสำเร็จ", image: img });
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
});

// 📌 ดึงรูปทั้งหมดของ bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const images = await BookingImage.findAll({
      where: { bookingId: req.params.bookingId },
      order: [["uploadedAt", "DESC"]],
    });
    res.json(images);
  } catch (error) {
    console.error("❌ Error fetching images:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
});

module.exports = router;
