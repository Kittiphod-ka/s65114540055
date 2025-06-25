import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const SlideCar = () => {
  const [slideCars, setSlideCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlideCars();
  }, []);

  const fetchSlideCars = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/slidecars"); // ✅ ตรวจสอบเส้นทาง API
      console.log("🚗 Slide Cars from API:", response.data); // ✅ LOG เช็คค่าที่ดึงมา
      setSlideCars(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching slide cars:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรถสไลด์นี้?")) {
      try {
        await axios.delete(`http://localhost:5000/api/slidecars/${id}`);
        fetchSlideCars(); // โหลดข้อมูลใหม่หลังจากลบ
      } catch (error) {
        console.error("❌ Error deleting slide car:", error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`🛠️ กำลังอัปเดตสถานะของรถ: ${id} → ${newStatus}`);
  
      const response = await axios.put(`http://localhost:5000/api/slidecars/update-status/${id}`, { status: newStatus });
  
      if (response.status === 200) {
        setSlideCars(prevCars =>
          prevCars.map(car => (car._id === id ? { ...car, status: newStatus } : car))
        );
      } else {
        console.error("❌ Error updating status: Unexpected response", response);
      }
    } catch (error) {
      console.error("❌ Error updating slide car status:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4">🚗 จัดการรถสไลด์</h2>

        <div className="flex justify-end mb-4">
          <Link to="/slidecars/add" className="bg-blue-500 text-white px-4 py-2 rounded-md">➕ เพิ่มรถสไลด์</Link>
        </div>

        {loading ? (
          <p className="text-center">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                  <th className="border border-gray-300 px-4 py-2">แบรนด์</th>
                  <th className="border border-gray-300 px-4 py-2">รุ่น</th>
                  <th className="border border-gray-300 px-4 py-2">ทะเบียน</th>
                  <th className="border border-gray-300 px-4 py-2">คนขับ</th>
                  <th className="border border-gray-300 px-4 py-2">สถานะ</th>
                  <th className="border border-gray-300 px-4 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {slideCars.length > 0 ? (
                  slideCars.map((car, index) => (
                    <tr key={car._id} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{car.brand}</td>
                      <td className="border border-gray-300 px-4 py-2">{car.model}</td>
                      <td className="border border-gray-300 px-4 py-2">{car.licensePlate}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {car.driver ? car.driver.username : "ยังไม่มีคนขับ"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                            value={car.status}
                            onChange={(e) => handleStatusChange(car._id, e.target.value)}
                            className={`px-2 py-1 rounded ${
                            car.status === "พร้อมใช้งาน" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                        >
                            <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                            <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
                        </select>
                        </td>
                      <td className="border border-gray-300 px-4 py-2 flex gap-2 justify-center">
                        <Link
                          to={`/slidecars/edit/${car._id}`}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(car._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">ไม่มีข้อมูลรถสไลด์</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideCar;
