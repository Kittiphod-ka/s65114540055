const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User, Driver } = require('../models');

dotenv.config();
const router = express.Router();

const findUserOrDriver = async (username) => {
  const user = await User.findOne({ where: { username } });
  if (user) return { user, role: user.role || 'user' };
  const driver = await Driver.findOne({ where: { username } });
  if (driver) return { user: driver, role: 'driver' };
  return null;
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const found = await findUserOrDriver(username);
    if (!found) return res.status(401).json({ message: 'ไม่พบผู้ใช้' });

    const isMatch = await bcrypt.compare(password, found.user.password);
    if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
      { id: found.user.id, role: found.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: found.user.id, username: found.user.username, role: found.role } });
  } catch (err) {
    console.error('auth/login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(400).json({ message: 'username ถูกใช้แล้ว' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, phone, password: hashed, role: role || 'user' });
    res.status(201).json({ message: 'สร้างบัญชีผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('auth/register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
