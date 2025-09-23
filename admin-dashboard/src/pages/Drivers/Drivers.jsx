import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ ใช้สำหรับนำทางไปหน้าแก้ไข
import Sidebar from "../../components/Sidebar";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }
  
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/drivers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ API Response:", response.data); // ✅ เช็คค่าที่ API ส่งกลับมา
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching drivers:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคนขับนี้?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
          return;
        }

        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/drivers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          alert("✅ ลบคนขับสำเร็จ!");
          fetchDrivers(); // โหลดข้อมูลใหม่
        } else {
          alert("❌ ไม่สามารถลบคนขับได้: " + response.data.message);
        }
      } catch (error) {
        console.error("❌ Error deleting driver:", error);
        if (error.response) {
          const status = error.response.status;
          if (status === 404) {
            alert("❌ ไม่พบข้อมูลคนขับที่ต้องการลบ!");
          } else if (status === 500) {
            alert("❌ เกิดข้อผิดพลาดในเซิร์ฟเวอร์!");
          } else {
            alert("❌ เกิดข้อผิดพลาด: " + error.response.data.message);
          }
        } else {
          alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้!");
        }
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "on" ? "off" : "on";
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/drivers/update-status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDrivers();
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar /> {/* ✅ แถบเมนูด้านซ้าย */}

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">🚖 จัดการคนขับ</h1>
          <button
            onClick={() => navigate("/drivers/add")}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            ➕ เพิ่มคนขับ
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          {loading ? (
            <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                  <th className="border border-gray-300 px-4 py-2">ยูสเซอร์เนม</th>
                  <th className="border border-gray-300 px-4 py-2">เบอร์โทร</th>
                  <th className="border border-gray-300 px-4 py-2">สถานะ</th>
                  <th className="border border-gray-300 px-4 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length > 0 ? (
                  drivers.map((driver, index) => (
                    <tr key={driver.id} className="hover:bg-gray-100 text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{driver.username}</td>
                      <td className="border border-gray-300 px-4 py-2">{driver.phone}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleStatusToggle(driver.id, driver.status)}
                          className={`px-2 py-1 rounded ${
                            driver.status === "on"
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {driver.status === "on" ? "🟢 เปิดใช้งาน" : "⚪ ปิดใช้งาน"}
                        </button>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/drivers/edit/${driver.id}`)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">❌ ไม่มีข้อมูลคนขับ</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      
      </div>
    </div>
  );
};

export default Drivers;
