const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: "❌ ไม่ได้รับอนุญาต (Invalid Token)" });
      }

      const token = authHeader.split(" ")[1];
      console.log("📢 Token ที่เซิร์ฟเวอร์ได้รับ:", token); 

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded Token:", decoded);
      req.user = decoded;
      next();
  } catch (error) {
      console.error("❌ Error verifying token:", error.message);
      return res.status(401).json({ message: "❌ Token ไม่ถูกต้อง" });
  }
};
