const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("📢 Token ที่เซิร์ฟเวอร์ได้รับ:", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("❌ ไม่พบหรือรูปแบบ token ไม่ถูกต้อง");
    return res.status(401).json({ message: "❌ ไม่ได้รับอนุญาต (Invalid Token)" });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log("✅ Decoded Token:", decoded);
    req.user = decoded;
    next();
    console.log("✅ ผ่าน authMiddleware แล้ว");
  } catch (err) {
    console.log("❌ Token verify fail:", err);
    return res.status(401).json({ message: "❌ ไม่ได้รับอนุญาต (Invalid Token)" });
      }
};