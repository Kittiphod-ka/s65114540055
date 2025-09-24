const fs = require("fs");
const path = require("path");
const { sequelize, User, Driver, SlideCar, Booking } = require("../models");

async function importCollection(model, fileName, uniqueKey) {
  const filePath = path.join("/app/backup", fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf-8").trim();

  // ถ้าไฟล์ว่างหรือเป็น array ว่าง
  if (!rawData || rawData === "[]") {
    console.log(`⚠️  ${fileName} is empty, skipping`);
    return;
  }

  let items;
  try {
    items = JSON.parse(rawData);
  } catch (err) {
    console.error(`❌ Failed to parse ${fileName}:`, err.message);
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    console.log(`⚠️  ${fileName} has no records, skipping`);
    return;
  }

  for (const item of items) {
    try {
      await model.findOrCreate({
        where: { [uniqueKey]: item[uniqueKey] },
        defaults: item,
      });
    } catch (err) {
      console.error(`❌ Failed to import record in ${fileName}:`, err.message);
    }
  }

  console.log(`✅ Imported ${items.length} records into ${model.name}`);
}

async function runImport() {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL");

    await sequelize.sync({ alter: true });

    await importCollection(User, "users.json", "email");
    await importCollection(Driver, "drivers.json", "username");
    await importCollection(SlideCar, "slidecars.json", "licensePlate");
    await importCollection(Booking, "bookings.json", "id");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await sequelize.close();
  }
}

runImport();
