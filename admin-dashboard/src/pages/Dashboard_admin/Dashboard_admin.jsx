import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

const DashboardAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }

      const response = await axios.get("http://localhost:30055/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 ข้อมูล Admin:", response.data); // ✅ เช็คค่าที่ได้จาก API
      setAdmins(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching admin data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-blue-600">📊 รายการ Admin</h1>

        {loading ? (
          <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="bg-white p-4 rounded shadow-md mt-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                  <th className="border border-gray-300 px-4 py-2">ยูสเซอร์เนม</th>
                  <th className="border border-gray-300 px-4 py-2">อีเมล</th>
                  <th className="border border-gray-300 px-4 py-2">บทบาท</th>
                  <th className="border border-gray-300 px-4 py-2">วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody>
                {admins.length > 0 ? (
                  admins.map((admin, index) => (
                    <tr key={admin.id} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{admin.username}</td>
                      <td className="border border-gray-300 px-4 py-2">{admin.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{admin.role}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(admin.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-red-500">
                      ❌ ไม่พบข้อมูล Admin
                    </td>
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

export default DashboardAdmin;
