const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ อ้างอิงไปยัง User
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" }, // ✅ อ้างอิงไปยัง Driver
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    user_phone: { type: String, required: true },
    vehicle_type: { type: String, required: true },
    vehicle_model: String,
    license_plate: String,
    pickup_location: {
        latitude: Number,
        longitude: Number,
    },
    dropoff_location: {
        latitude: Number,
        longitude: Number,
    },
    note: String,
    distance: Number,
    price: Number,
    service_fee: { type: Number, default: 100 },
    total_price: Number,
    payment_status: { type: String, default: "pending" },
    
    driver_id: { type: String, default: null },
    driver_location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
    status: {
        type: String,
        enum: ["รอคนขับรับงาน", "กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"],
        default: "รอคนขับรับงาน"
    },
    status2: {  // ✅ **เพิ่ม `status2` เพื่อบอกว่าไปจุดรับ หรือไปจุดส่ง**
        type: String,
        enum: ["กำลังไปรับ", "กำลังไปส่ง", "เสร็จสิ้น"],
        default: "กำลังไปรับ"
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
