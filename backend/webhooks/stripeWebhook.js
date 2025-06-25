const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking"); // Import Model

// ✅ Webhook สำหรับตรวจสอบสถานะการชำระเงิน
router.post("/webhooks", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      console.log(`✅ การชำระเงินเสร็จสิ้นสำหรับ Booking ID: ${bookingId}`);

      // ✅ อัปเดตการจองใน Database
      await Booking.findByIdAndUpdate(bookingId, { status: "paid" });

      res.status(200).send("OK");
    } else {
      res.status(400).send(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

module.exports = router;
