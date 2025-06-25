const express = require("express");
const multer = require("multer");
const path = require("path");
const BookingImage = require("../models/BookingImage");

const router = express.Router();

// 📌 ตั้งค่าอัปโหลดไฟล์ไปยังโฟลเดอร์ uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // รูปจะถูกเก็บที่ /uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.bookingId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// 📌 API อัปโหลดรูป
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

    const imageUrl = `/uploads/${req.file.filename}`;

    const newImage = new BookingImage({ bookingId, imageUrl });
    await newImage.save();

    res.status(201).json({ message: "📸 รูปอัปโหลดสำเร็จ", imageUrl });
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
});

// 📌 API ดึงรูปทั้งหมดของ `bookingId`
router.get("/:bookingId", async (req, res) => {
  try {
    const images = await BookingImage.find({ bookingId: req.params.bookingId });
    res.json(images);
  } catch (error) {
    console.error("❌ Error fetching images:", error);
    res.status(500).json({ message: "❌ Server Error" });
  }
});

module.exports = router;
