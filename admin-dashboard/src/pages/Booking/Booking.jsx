import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ ดึงข้อมูลการจองทั้งหมด
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }

      const response = await axios.get("http://26.120.17.211:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      setLoading(false);
    }
  };

  // ✅ ลบการจอง
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?")) {
      try {
        await axios.delete(`http://26.120.17.211:5000/api/bookings/${id}`);
        fetchBookings(); // โหลดข้อมูลใหม่หลังจากลบ
      } catch (error) {
        console.error("❌ Error deleting booking:", error);
      }
    }
  };

  // ✅ อัปเดตสถานะใน Database
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token"); // ✅ ใช้ Token
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }
  
      console.log(`📡 กำลังอัปเดตสถานะ Booking ID: ${id} -> ${newStatus}`);
  
      const response = await axios.put(
        `http://26.120.17.211:5000/api/bookings/update-status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        console.log("✅ อัปเดตสถานะสำเร็จ!", response.data);
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === id ? { ...booking, status: newStatus } : booking
          )
        ); // ✅ อัปเดตสถานะใน UI ทันที
      } else {
        console.error("❌ ไม่สามารถอัปเดตสถานะได้", response);
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการอัพเดตสถานะการจอง:", error);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4">📋 จัดการการจอง</h2>

        {loading ? (
          <p className="text-center">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                  <th className="border border-gray-300 px-4 py-2">ยูสเซอร์เนมผู้จอง</th>
                  <th className="border border-gray-300 px-4 py-2">โทรศัพท์</th>
                  <th className="border border-gray-300 px-4 py-2">จุดรับ</th>
                  <th className="border border-gray-300 px-4 py-2">จุดส่ง</th>
                  <th className="border border-gray-300 px-4 py-2">ราคา</th>
                  <th className="border border-gray-300 px-4 py-2">สถานะ</th>
                  <th className="border border-gray-300 px-4 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking._id} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.user_phone}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.pickup_location.latitude}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.dropoff_location.latitude}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.total_price} บาท</td>
                      <td className="border border-gray-300 px-4 py-2">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                              className={`px-2 py-1 rounded 
                                ${
                                  booking.status === "รอดำเนินการ"
                                    ? "bg-yellow-500 text-white"
                                    : booking.status === "กำลังดำเนินการ"
                                    ? "bg-blue-500 text-white"
                                    : booking.status === "เสร็จสิ้น"
                                    ? "bg-green-500 text-white"
                                    : booking.status === "ยกเลิก"
                                    ? "bg-red-500 text-white"  // ✅ สีแดงเมื่อเป็น "ยกเลิก"
                                    : "bg-gray-500 text-white"
                                }`}
                            >
                              <option value="รอดำเนินการ">รอดำเนินการ</option>
                              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                              <option value="ยกเลิก">ยกเลิก</option> {/* ✅ เพิ่มตัวเลือกนี้ */}
                            </select>
                          </td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                        {/* ✅ ปุ่มดูข้อมูล */}
                        <button
                          onClick={() => navigate(`/booking/${booking._id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          🔍 ดูข้อมูล
                        </button>
                        {/* ✅ ปุ่มลบ */}
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">ไม่มีข้อมูลการจอง</td>
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

export default Booking;
