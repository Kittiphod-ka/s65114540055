import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddDriver = () => {
  const [driver, setDriver] = useState({
    username: "",
    name: "",
    password: "",
    phone: "",
    status: "off",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/drivers", driver);
      alert("✅ เพิ่มคนขับสำเร็จ!");
      navigate("/drivers");
    } catch (error) {
      console.error("❌ Error adding driver:", error);
      alert("❌ เพิ่มคนขับไม่สำเร็จ!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">➕ เพิ่มคนขับ</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">ชื่อผู้ใช้ (Username)</label>
          <input type="text" name="username" value={driver.username} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">ชื่อ-นามสกุล</label>
          <input type="text" name="name" value={driver.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">รหัสผ่าน</label>
          <input type="password" name="password" value={driver.password} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">เบอร์โทรศัพท์</label>
          <input type="text" name="phone" value={driver.phone} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">บันทึก</button>
      </form>
    </div>
  );
};

export default AddDriver;
