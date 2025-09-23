const express = require('express');
const { SlideCar, Driver } = require('../models');
const router = express.Router();

router.get('/', async (_req, res) => {
  const cars = await SlideCar.findAll({
        include: [{ model: Driver, as: 'driver', attributes: ['id', 'username', 'name'] }],
        order: [['id', 'ASC']],
      });
      res.json(cars);
});

router.post('/', async (req, res) => {
  const { brand, model, licensePlate, driverId, status } = req.body;
  const car = await SlideCar.create({
    brand,
    model,
    licensePlate,
    driverId: driverId || null,
    status
  });
  res.status(201).json(car);
});

router.get('/:id', async (req, res) => {
  try {
    const car = await SlideCar.findByPk(req.params.id, {
      include: [{ model: Driver, as: 'driver', attributes: ['id', 'username', 'name'] }],
    });
    if (!car) return res.status(404).json({ message: 'ไม่พบรถ' });
    res.json(car);
  } catch (error) {
    console.error('❌ Error fetching car:', error);
    res.status(500).json({ message: '❌ ไม่สามารถดึงข้อมูลรถได้', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const car = await SlideCar.findByPk(req.params.id);
  if (!car) return res.status(404).json({ message: 'ไม่พบรถ' });
  await car.update(req.body);
  res.json(car);
});

router.delete('/:id', async (req, res) => {
  try {
    const car = await SlideCar.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'ไม่พบรถ' });

    await car.destroy();
    res.json({ message: '✅ ลบรถเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('❌ Error deleting car:', error);
    res.status(500).json({ message: '❌ ไม่สามารถลบรถได้', error: error.message });
  }
});

router.put('/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const slideCar = await SlideCar.findByPk(id);
    if (!slideCar) return res.status(404).json({ message: '❌ ไม่พบข้อมูลรถสไลด์!' });
    slideCar.status = status;
    await slideCar.save();
    res.json(slideCar);
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({ message: '❌ ไม่สามารถอัปเดตสถานะได้!', error: error.message });
  }
});

module.exports = router;
