import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditDriver = () => {
  const { id } = useParams(); // ✅ ดึงค่า id จาก URL
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchDriver = async () => {
    try {
      console.log("🔍 กำลังดึงข้อมูลคนขับ:", id);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ ได้รับข้อมูล:", response.data);
      setDriver(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching driver:", error);
      setError("❌ ไม่พบข้อมูลคนขับ!");
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/drivers/${id}`, driver, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ อัปเดตข้อมูลสำเร็จ!");
      navigate("/drivers");
    } catch (error) {
      console.error("❌ Error updating driver:", error);
      alert("❌ ไม่สามารถอัปเดตข้อมูลได้!");
    }
  };

  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">✏️ แก้ไขข้อมูลคนขับ</h2>
      <form onSubmit={handleUpdate} className="mt-4">
        <div className="mb-2">
          <label className="block font-semibold">ยูสเซอร์เนม:</label>
          <input type="text" value={driver.username} disabled className="border p-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">เบอร์โทร:</label>
          <input
            type="text"
            value={driver.phone}
            onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">สถานะ:</label>
          <select
            value={driver.status}
            onChange={(e) => setDriver({ ...driver, status: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="on">🟢 เปิดใช้งาน</option>
            <option value="off">⚪ ปิดใช้งาน</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
          💾 บันทึก
        </button>
      </form>
    </div>
  );
};

export default EditDriver;
