import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddSlideCar = () => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    driverId: "",
    status: "พร้อมใช้งาน",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:30055/api/slidecars", formData);
      alert("🚗 เพิ่มรถสไลด์สำเร็จ!");
      navigate("/slidecar"); // กลับไปหน้ารายการรถสไลด์
    } catch (error) {
      console.error("❌ Error adding slide car:", error);
      alert("❌ เพิ่มรถสไลด์ไม่สำเร็จ!");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">➕ เพิ่มรถสไลด์</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">แบรนด์</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">รุ่น</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">ทะเบียน</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">คนขับ (ไม่ต้องระบุก็ได้)</label>
          <input
            type="text"
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">สถานะ</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
            <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={() => navigate("/slidecars")} className="bg-gray-500 text-white px-4 py-2 rounded">
            🔙 กลับ
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            ✅ เพิ่มรถสไลด์
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSlideCar;
