import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ State สำหรับค้นหา

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers(); // โหลดข้อมูลใหม่หลังจากลบ
      } catch (error) {
        console.error("❌ Error deleting user:", error);
      }
    }
  };

  // ✅ ฟังก์ชันกรองผู้ใช้ตาม `username`
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar /> {/* ✅ เมนูด้านซ้าย */}

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-blue-600">👤 จัดการผู้ใช้</h1>

        {/* ✅ ช่องค้นหา */}
        <div className="my-4 flex justify-end">
          <input
            type="text"
            placeholder="🔍 ค้นหายูสเซอร์เนม..."
            className="border p-2 rounded-md w-64 shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white p-4 rounded shadow-md mt-4">
          {loading ? (
            <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                  <th className="border border-gray-300 px-4 py-2">ยูสเซอร์เนม</th>
                  <th className="border border-gray-300 px-4 py-2">อีเมล</th>
                  <th className="border border-gray-300 px-4 py-2">เบอร์โทร</th>
                  <th className="border border-gray-300 px-4 py-2">บทบาท</th>
                  <th className="border border-gray-300 px-4 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-100 text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.phone}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          🗑 ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">❌ ไม่มีข้อมูลผู้ใช้</td>
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

export default Users;
