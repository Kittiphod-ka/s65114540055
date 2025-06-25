const mongoose = require("mongoose");

const SlideCarSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  status: { type: String, enum: ["พร้อมใช้งาน", "ไม่พร้อมใช้งาน"], default: "พร้อมใช้งาน" }
});

module.exports = mongoose.model("SlideCar", SlideCarSchema);
