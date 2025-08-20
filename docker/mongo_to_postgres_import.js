require('dotenv').config();
const fs = require("fs");
const path = require("path");
const { sequelize } = require("./backend/config/db");
const { User, Driver, SlideCar, Booking } = require("./backend/models");

// ฟังก์ชันแปลงวันที่จาก Mongo
function parseMongoDate(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }
  if (typeof value === "object" && value.$date) {
    const d = new Date(value.$date);
    return isNaN(d) ? null : d;
  }
  return null;
}

// อ่านไฟล์ JSON/NDJSON
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return [];
  try {
    if (raw[0] === "[") {
      return JSON.parse(raw);
    } else {
      return raw
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l));
    }
  } catch (err) {
    console.error("❌ JSON parse error in", filePath, err.message);
    return [];
  }
}

// main import
async function main() {
  const args = process.argv.slice(2);
  let baseDir = "./mongo-backup";
  const dirIndex = args.findIndex((a) => a === "--dir" || a.startsWith("--dir="));
  if (dirIndex !== -1) {
    if (args[dirIndex].startsWith("--dir=")) {
      baseDir = args[dirIndex].split("=")[1];
    } else if (args[dirIndex + 1]) {
      baseDir = args[dirIndex + 1];
    }
  }
  const sync = args.includes("--sync");

  console.log("📂 Base dir:", baseDir);

  // detect files
  const files = {
    users: ["users.json", "user.json", "users.ndjson", "user.ndjson"],
    drivers: ["drivers.json", "driver.json", "drivers.ndjson", "driver.ndjson"],
    slide_cars: [
      "slide_cars.json",
      "cars.json",
      "slide_cars.ndjson",
      "cars.ndjson",
    ],
    bookings: ["bookings.json", "orders.json", "bookings.ndjson", "orders.ndjson"],
  };

  const detected = {};
  for (const [key, patterns] of Object.entries(files)) {
    detected[key] =
      patterns
        .map((f) => path.join(baseDir, f))
        .find((f) => fs.existsSync(f)) || null;
  }
  console.log("🔎 Detected files:", detected);

  try {
    await sequelize.authenticate();
    console.log("✅ Connected PostgreSQL");
    if (sync) {
      await sequelize.sync();
      console.log("🔧 sequelize.sync() done");
    }
  } catch (err) {
    console.error("❌ Database connection failed", err.message);
    process.exit(1);
  }

  // ลบข้อมูลทุกตารางก่อน import ใหม่
  await Booking.destroy({ where: {} });
  await SlideCar.destroy({ where: {} });
  await Driver.destroy({ where: {} });
  await User.destroy({ where: {} });
  console.log("🗑️ Cleared all tables");

  // === Import Users ===
  if (detected.users) {
    const docs = readJsonFile(detected.users);
    for (const doc of docs) {
      const userData = {
        username: doc.username,
        name: doc.name || null,
        email: doc.email,
        phone: doc.phone || null,
        password: doc.password,
        profile: doc.profile || "",
        role: doc.role || "user",
        createdAt: parseMongoDate(doc.createdAt || doc.created_at) || new Date(),
        updatedAt: parseMongoDate(doc.updatedAt || doc.updated_at) || new Date(),
      };
      await User.create(userData).catch((e) => {
        console.error("❌ User import failed:", e.errors || e.message, userData);
      });
    }
    console.log(`👤 Imported ${docs.length} users`);
  }

  // === Import Drivers ===
  if (detected.drivers) {
    const docs = readJsonFile(detected.drivers);
    for (const doc of docs) {
      const driverData = {
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        password: doc.password,
        licensePlate: doc.licensePlate,
        createdAt: parseMongoDate(doc.createdAt || doc.created_at) || new Date(),
        updatedAt: parseMongoDate(doc.updatedAt || doc.updated_at) || new Date(),
      };
      await Driver.create(driverData).catch((e) => {
        console.error("❌ Driver import failed:", e.errors || e.message, driverData);
      });
    }
    console.log(`🚖 Imported ${docs.length} drivers`);
  }

  // === Import SlideCars ===
  if (detected.slide_cars) {
    const docs = readJsonFile(detected.slide_cars);
    for (const doc of docs) {
      const carData = {
        image: doc.image,
        title: doc.title,
        description: doc.description,
        brand: doc.brand,
        model: doc.model,
        licensePlate: doc.licensePlate,
        driverId: doc.driverId || null,
        status: doc.status || null,
        createdAt: parseMongoDate(doc.createdAt || doc.created_at) || new Date(),
        updatedAt: parseMongoDate(doc.updatedAt || doc.updated_at) || new Date(),
      };
      await SlideCar.create(carData).catch((e) => {
        console.error("❌ SlideCar import failed:", e.errors || e.message, carData);
      });
    }
    console.log(`🚗 Imported ${docs.length} slide cars`);
  }

  // === Import Bookings ===
  if (detected.bookings) {
    const docs = readJsonFile(detected.bookings);
    for (const doc of docs) {
      const bookingData = {
        pickup_latitude: doc.pickup_location?.latitude || null,
        pickup_longitude: doc.pickup_location?.longitude || null,
        dropoff_latitude: doc.dropoff_location?.latitude || null,
        dropoff_longitude: doc.dropoff_location?.longitude || null,
        status: doc.status || "pending",
        items: doc.items || [],
        userId: doc.userId || null,
        driverId: doc.driverId || null,
        createdAt: parseMongoDate(doc.createdAt || doc.created_at) || new Date(),
        updatedAt: parseMongoDate(doc.updatedAt || doc.updated_at) || new Date(),
      };
      await Booking.create(bookingData).catch((e) => {
        console.error("❌ Booking import failed:", e.errors || e.message, bookingData);
      });
    }
    console.log(`📦 Imported ${docs.length} bookings`);
  }

  console.log("🎉 Import finished");
  process.exit(0);
}

main();