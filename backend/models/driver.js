const mongoose = require("mongoose");


const driverSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["on", "off"], default: "off" }, 
    role: { type: String, default: "driver" },
});

module.exports = mongoose.model("Driver", driverSchema);
