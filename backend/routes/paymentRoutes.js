const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Booking } = require("../models");

// ✅ ตัวอย่างสร้าง Payment Link (หากคุณใช้ Payment Link จริง)
router.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, bookingData } = req.body;
    if (!amount || !bookingData) {
      return res.status(400).json({ message: "❌ ข้อมูลไม่ครบถ้วน!" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ message: "❌ ไม่ได้ตั้งค่า STRIPE_SECRET_KEY" });
    }

    // ตัวอย่าง Payment Links (ปรับ spec ให้ตรงกับธุรกิจจริงของคุณ)
    const product = await stripe.products.create({
      name: `Booking #temp`,
    });

    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100),
      currency: "thb",
      product: product.id,
    });

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });

    res.json({ url: link.url });
  } catch (error) {
    console.error("❌ Error creating payment link:", error);
    res.status(500).json({ message: "❌ เกิดข้อผิดพลาดในการสร้าง Payment Link" });
  }
});

// ✅ อัปเดตสถานะการชำระเงินของ Booking
router.post("/update-booking-payment", async (req, res) => {
  try {
    const { bookingId, payment_status = "paid", total_price } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "❌ ไม่พบ Booking นี้" });
    }

    await booking.update({
      payment_status,
      ...(typeof total_price !== "undefined" ? { total_price } : {}),
    });

    res.json({ message: "✅ ชำระเงินสำเร็จ", booking });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).json({ message: "❌ เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน" });
  }
});

module.exports = router;
