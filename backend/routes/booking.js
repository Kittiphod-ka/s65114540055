const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking"); // เชื่อมกับ Model Booking
const authMiddleware = require("../middleware/authMiddleware"); // ป้องกัน Route
const mongoose = require("mongoose");

// ✅ สร้างการจองใหม่
router.post("/create", async (req, res) => {
  try {
      console.log("📢 ข้อมูลที่ได้รับจาก Frontend:", req.body);
      const newBooking = new Booking(req.body);
      const savedBooking = await newBooking.save();
      res.status(201).json(savedBooking);
  } catch (error) {
      console.error("❌ Error creating booking:", error);
      res.status(500).json({ message: "❌ ไม่สามารถสร้างการจองได้" });
  }
});

// ✅ ดึงรายการจองทั้งหมด (เฉพาะ Admin)
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("❌ Error fetching bookings:", error.message);
        res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลการจองได้" });
    }
});

// ทดสอบเอาไว้ก่อน _id
router.get("/active", async (req, res) => {
    try {
        console.log("📢 กำลังดึงข้อมูลการจองที่กำลังดำเนินการ...");
        const activeBookings = await Booking.find({ status: "กำลังดำเนินการ" });

        if (!activeBookings.length) {
            return res.status(404).json({ message: "❌ ไม่มีการจองที่กำลังดำเนินการ" });
        }

        console.log("✅ ข้อมูลการจองที่กำลังดำเนินการ:", activeBookings);
        res.json(activeBookings);
    } catch (error) {
        console.error("❌ Error fetching active bookings:", error);
        res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลการจองได้" });
    }
});




// ✅ ดึงรายละเอียดการจองตาม ID
router.get("/:id", async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("user", "username phone") // ✅ อ้างอิงข้อมูลผู้ใช้
        .populate("driver", "username phone"); // ✅ อ้างอิงข้อมูลคนขับ
  
      if (!booking) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลการจอง!" });
      }
  
      res.json(booking);
    } catch (error) {
      console.error("❌ Error fetching booking:", error);
      res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้!" });
    }
  });

  
  router.get("/booking-images/:bookingId", async (req, res) => {
    try {
      const images = await BookingImage.find({ bookingId: req.params.bookingId });
  
      if (!images.length) {
        return res.status(404).json({ message: "❌ ไม่พบรูปภาพ!" });
      }
  
      res.json(images);
    } catch (error) {
      console.error("❌ Error fetching booking images:", error);
      res.status(500).json({ message: "❌ ไม่สามารถดึงรูปภาพได้!" });
    }
  });




// ✅ อัปเดตสถานะการชำระเงิน
router.post("/confirm-payment", async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: "❌ ไม่มี `_id` ถูกส่งมา" });

        const booking = await Booking.findById(_id);
        if (!booking) return res.status(404).json({ message: "❌ ไม่พบการจอง" });

        booking.payment_status = "paid"; // ✅ อัปเดตสถานะเป็น 'paid'
        await booking.save();

        res.json({ message: "✅ บันทึกการชำระเงินสำเร็จ" });
    } catch (error) {
        console.error("❌ Error confirming payment:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน" });
    }
});

// ✅ อัปเดตสถานะการจองโดยคนขับ
router.post("/update-status/:id", async (req, res) => {
    try {
        const { _id, status, driver_id } = req.body;
        if (!["กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"].includes(status)) {
            return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
        }

        const booking = await Booking.findById(_id);
        if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

        booking.status = status;
        if (driver_id) booking.driver_id = driver_id; // ✅ เพิ่มคนขับที่รับงาน

        await booking.save();
        res.json({ message: "✅ อัปเดตสถานะสำเร็จ", booking });
    } catch (error) {
        console.error("❌ Error updating status:", error);
        res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้" });
    }
});

router.post("/cancel-order", async (req, res) => {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "Missing booking ID" });

    const booking = await Booking.findById(_id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "ยกเลิก";
    await booking.save();

    res.json({ message: "Booking canceled successfully" });
});


// ✅ ดึงรายการจองของผู้ใช้ตาม user_id
router.get("/user/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const bookings = await Booking.find({ user_id });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "ไม่พบรายการจองของผู้ใช้" });
        }

        res.json(bookings);
    } catch (error) {
        console.error("❌ Error fetching user bookings:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// ✅ ดึงงานทั้งหมดที่รอคนขับรับ
router.get("/pending", async (req, res) => {
    try {
        const bookings = await Booking.find({ status: "รอคนขับรับงาน" });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "ไม่มีงานที่รอรับ" });
        }

        res.json(bookings);
    } catch (error) {
        console.error("❌ Error fetching pending bookings:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// ✅ ดึงงานของคนขับที่รับไปแล้ว
router.get("/driver/:driver_id", async (req, res) => {
    try {
        const { driver_id } = req.params;
        const bookings = await Booking.find({ driver_id });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "ไม่มีงานที่คนขับรับไว้" });
        }

        res.json(bookings);
    } catch (error) {
        console.error("❌ Error fetching driver bookings:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});


// ✅ อัปเดตตำแหน่ง GPS ของคนขับ
router.post("/update-driver-location", async (req, res) => {
    try {
      const { bookingId, latitude, longitude, driverId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: "❌ รหัสการจองไม่ถูกต้อง!" });
      }
  
      console.log(`📍 อัปเดตตำแหน่ง: Booking ${bookingId}, Driver ${driverId}, Lat: ${latitude}, Lng: ${longitude}`);
  
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { driver_location: { latitude, longitude } },
        { new: true }
      );
  
      if (!updatedBooking) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลการจอง!" });
      }
  
      res.json({ message: "✅ อัปเดตตำแหน่งสำเร็จ!", updatedBooking });
    } catch (error) {
      console.error("❌ Error updating driver location:", error);
      res.status(500).json({ message: "❌ ไม่สามารถอัปเดตตำแหน่งได้" });
    }
  });

  router.get("/driver-location/:booking_id", async (req, res) => {
    try {
        const { booking_id } = req.params;
        const booking = await Booking.findById(booking_id);

        if (!booking) {
            return res.status(404).json({ message: "❌ ไม่พบการจอง" });
        }

        if (!booking.driver_location) {
            console.warn(`⚠️ ตำแหน่งของคนขับยังไม่มีข้อมูลสำหรับงาน ${booking_id}`);
            return res.json({ latitude: null, longitude: null }); // ✅ ส่งข้อมูลว่าง แทนการส่ง Error
        }

        res.json({
            latitude: booking.driver_location.latitude,
            longitude: booking.driver_location.longitude
        });
    } catch (error) {
        console.error("❌ Error fetching driver location:", error);
        res.status(500).json({ message: "❌ ไม่สามารถดึงตำแหน่งของคนขับได้" });
    }
});
  

// ✅ อัปเดตสถานะการเดินทาง (status2)
router.post("/update-status2", async (req, res) => {
    try {
        const { _id, status2 } = req.body;

        console.log(`📡 กำลังอัปเดตสถานะการเดินทางของงาน ID: ${_id} เป็น '${status2}'`);

        // ค้นหางานที่ต้องการอัปเดต
        const booking = await Booking.findById(_id);
        if (!booking) {
            return res.status(404).json({ message: "❌ ไม่พบการจอง" });
        }

        booking.status2 = status2; // ✅ อัปเดตสถานะการเดินทาง
        await booking.save();

        console.log("✅ สถานะการเดินทางอัปเดตเรียบร้อย:", booking);

        res.json({ message: "✅ อัปเดตสถานะสำเร็จ", booking });
    } catch (error) {
        console.error("❌ Error updating status2:", error);
        res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้" });
    }
});

router.get("/get-status2/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "❌ ไม่พบการจอง" });
        }
        res.json({ status2: booking.status2 });
    } catch (error) {
        console.error("❌ Error fetching status2:", error);
        res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้" });
    }
});


router.put("/update-status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "❌ รหัสการจองไม่ถูกต้อง" });
      }
  
      console.log(`📡 กำลังอัปเดตสถานะ Booking ID: ${id} -> ${status}`);
  
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: id }, // ✅ ใช้ findOneAndUpdate เพื่อความแน่นอน
        { status },
        { new: true }
      );
  
      if (!updatedBooking) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลการจอง!" });
      }
  
      console.log("✅ อัปเดตสถานะสำเร็จ!", updatedBooking);
      res.json({ message: "✅ อัปเดตสถานะสำเร็จ!", updatedBooking });
    } catch (error) {
      console.error("❌ Error updating booking status:", error);
      res.status(500).json({ message: "❌ ไม่สามารถอัปเดตสถานะได้!" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ กำลังลบ Booking ID: ${id}`);
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "❌ รหัสการจองไม่ถูกต้อง" });
      }
  
      const deletedBooking = await Booking.findByIdAndDelete(id);
      if (!deletedBooking) {
        return res.status(404).json({ message: "❌ ไม่พบข้อมูลการจอง" });
      }
  
      console.log("✅ ลบสำเร็จ:", deletedBooking);
      res.json({ message: "✅ ลบการจองสำเร็จ!" });
    } catch (error) {
      console.error("❌ Error deleting booking:", error);
      res.status(500).json({ message: "❌ ไม่สามารถลบได้!" });
    }
  });

module.exports = router;
