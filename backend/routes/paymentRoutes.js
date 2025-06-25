const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking"); // ✅ นำเข้า Model Booking

router.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, bookingData } = req.body;

    if (!amount || !bookingData) {
      return res.status(400).json({ message: "❌ ข้อมูลไม่ครบถ้วน!" });
    }

    console.log("📡 กำลังสร้าง Payment Link สำหรับ:", bookingData);

    // 🔴 เช็คว่ามี API Key สำหรับ Payment Gateway หรือไม่
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "❌ ไม่พบ PAYMENT_API_KEY ใน .env!" });
    }

    // ✅ ส่งข้อมูลไปที่ Payment Gateway (เช่น Omise, Stripe)
    const paymentResponse = await axios.post(
      "https://api.payment-gateway.com/create-link",
      {
        amount,
        currency: "THB",
        description: `Booking ID: ${bookingData._id}`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYMENT_API_KEY}` },
      }
    );

    if (!paymentResponse.data || !paymentResponse.data.url) {
      return res.status(500).json({ message: "❌ ไม่สามารถสร้างลิงก์ชำระเงินได้!" });
    }

    res.json({ url: paymentResponse.data.url, bookingId: bookingData._id });
  } catch (error) {
    console.error("❌ Error creating payment link:", error);
    res.status(500).json({ message: "❌ ไม่สามารถสร้างลิงก์ชำระเงินได้!" });
  }
});

router.post("/confirm-payment", async (req, res) => {
  try {
      const { _id } = req.body;

      if (!_id || _id === "undefined") {
          return res.status(400).json({ message: "❌ _id ไม่ถูกต้อง" });
      }

      console.log("✅ กำลังอัปเดตการชำระเงินสำหรับ Booking _id:", _id);

      const booking = await Booking.findByIdAndUpdate(
          _id,
          { payment_status: "paid" },
          { new: true }
      );

      if (!booking) {
          return res.status(404).json({ message: "❌ ไม่พบ Booking นี้" });
      }

      res.json({ message: "✅ ชำระเงินสำเร็จ", booking });
  } catch (error) {
      console.error("❌ Error updating booking:", error);
      res.status(500).json({ message: "❌ เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน" });
  }
});

module.exports = router;
