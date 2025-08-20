const express = require('express');
const { Booking, User, Driver } = require('../models');
const router = express.Router();

router.get('/', async (_req, res) => {
  const list = await Booking.findAll({
    include: [
      { model: User, attributes: ['id', 'username', 'email', 'phone'] },
      { model: Driver, attributes: ['id', 'username', 'name', 'phone'] },
    ],
    order: [['id', 'DESC']],
  });
  res.json(list);
});

router.post('/', async (req, res) => {
  const b = await Booking.create(req.body);
  res.status(201).json(b);
});

module.exports = router;
