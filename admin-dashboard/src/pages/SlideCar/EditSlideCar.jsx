import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditSlideCar = () => {
  const { id } = useParams(); // ✅ ดึงค่า ID ของรถจาก URL
  const navigate = useNavigate();
  const [slideCar, setSlideCar] = useState(null);
  const [drivers, setDrivers] = useState([]); // ✅ รายชื่อคนขับ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlideCar();
    fetchDrivers(); // ✅ โหลดรายชื่อคนขับทั้งหมด
  }, []);

  const fetchSlideCar = async () => {
    try {
      console.log("🚗 กำลังดึงข้อมูลรถสไลด์:", id);
      const response = await axios.get(`http://localhost:5000/api/slidecars/${id}`);
      console.log("✅ ได้รับข้อมูลรถสไลด์:", response.data);
      setSlideCar(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching slide car:", error);
      setError("❌ ไม่พบข้อมูลรถสไลด์!");
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log("🔍 กำลังดึงรายชื่อคนขับ...");
      const response = await axios.get("http://localhost:5000/api/drivers");
      console.log("✅ ได้รับรายชื่อคนขับ:", response.data);
      setDrivers(response.data);
    } catch (error) {
      console.error("❌ Error fetching drivers:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/slidecars/${id}`, slideCar);
      alert("✅ อัปเดตรถสไลด์สำเร็จ!");
      navigate("/slidecar");
    } catch (error) {
      console.error("❌ Error updating slide car:", error);
      alert("❌ ไม่สามารถอัปเดตรถสไลด์ได้!");
    }
  };

  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">✏️ แก้ไขข้อมูลรถสไลด์</h2>
      <form onSubmit={handleUpdate} className="mt-4">
        <div className="mb-2">
          <label className="block font-semibold">แบรนด์:</label>
          <input
            type="text"
            value={slideCar.brand}
            onChange={(e) => setSlideCar({ ...slideCar, brand: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">รุ่น:</label>
          <input
            type="text"
            value={slideCar.model}
            onChange={(e) => setSlideCar({ ...slideCar, model: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">ทะเบียน:</label>
          <input
            type="text"
            value={slideCar.licensePlate}
            onChange={(e) => setSlideCar({ ...slideCar, licensePlate: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">สถานะ:</label>
          <select
            value={slideCar.status}
            onChange={(e) => setSlideCar({ ...slideCar, status: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="พร้อมใช้งาน">🟢 พร้อมใช้งาน</option>
            <option value="ไม่พร้อมใช้งาน">⚪ ไม่พร้อมใช้งาน</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block font-semibold">คนขับ:</label>
          <select
            value={slideCar.driver || ""}
            onChange={(e) => setSlideCar({ ...slideCar, driver: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="">ไม่มีคนขับ</option>
            {drivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.username} - {driver.phone}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
          💾 บันทึก
        </button>
      </form>
    </div>
  );
};

export default EditSlideCar;
