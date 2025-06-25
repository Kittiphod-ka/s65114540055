import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // 🔥 กลับไปหน้าล็อกอินเมื่อออกจากระบบ
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col p-5 h-screen">
      <h2 className="text-xl font-bold mb-5 flex items-center">
        🚗 <span className="ml-2">ระบบจัดการ</span>
      </h2>
      <ul className="space-y-4">
        {/* <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => navigate("/dashboard_admin")}>🏠 ผู้ดูแลระบบ</li> */}
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => navigate("/users")}>👥 จัดการสมาชิก</li>
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => navigate("/drivers")}>🚖 จัดการคนขับ</li>
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => navigate("/slidecar")}>📊 ข้อมูลสไลด์</li>
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => navigate("/booking")}>📋 จัดการงาน</li>
      </ul>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 py-2 rounded text-center font-bold"
      >
        🚪 ออกจากระบบ
      </button>
    </div>
  );
};

export default Sidebar;
