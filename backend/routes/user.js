const express = require('express');
const { User } = require('../models');
const router = express.Router();

router.get('/', async (_req, res) => {
  const users = await User.findAll({ order: [['id', 'ASC']] });
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const u = await User.findByPk(req.params.id);
  if (!u) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
  res.json(u);
});

module.exports = router;
