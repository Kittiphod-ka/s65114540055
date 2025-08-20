const express = require('express');
const { SlideCar, Driver } = require('../models');
const router = express.Router();

router.get('/', async (_req, res) => {
  const cars = await SlideCar.findAll({
    include: [{ model: Driver, attributes: ['id', 'username', 'name'] }],
    order: [['id', 'ASC']],
  });
  res.json(cars);
});

router.post('/', async (req, res) => {
  const { brand, model, licensePlate, driverId, status } = req.body;
  const car = await SlideCar.create({ brand, model, licensePlate, driverId: driverId || null, status });
  res.status(201).json(car);
});

router.put('/:id', async (req, res) => {
  const car = await SlideCar.findByPk(req.params.id);
  if (!car) return res.status(404).json({ message: 'ไม่พบรถ' });
  await car.update(req.body);
  res.json(car);
});

router.delete('/:id', async (req, res) => {
  const car = await SlideCar.findByPk(req.params.id);
  if (!car) return res.status(404).json({ message: 'ไม่พบรถ' });
  await car.destroy();
  res.json({ ok: true });
});

module.exports = router;
