import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

const BookingDetail = () => {
  const { id } = useParams(); // ✅ ดึง ID ของการจองจาก URL
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ ไม่มี Token! กรุณาล็อกอินใหม่");
        return;
      }
  
      const response = await axios.get(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setBooking(response.data);
      fetchImages(id); // ✅ เรียก API โหลดรูปหลังจาก booking ถูกตั้งค่า
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching booking:", error);
      setLoading(false);
    }
  };

  const fetchImages = async (bookingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/booking-images/${bookingId}`);
      setImages(response.data);
    } catch (error) {
      console.error("❌ Error fetching images:", error);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar /> {/* ✅ เมนูด้านซ้าย */}

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-blue-600">📋 รายละเอียดงาน</h1>

        {loading ? (
          <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="bg-white p-4 rounded shadow-md mt-4">
            <p><strong>📍 จุดรับ:</strong> {booking.pickup_location.latitude}</p>
            <p><strong>📍 จุดส่ง:</strong> {booking.dropoff_location.latitude}</p>
            <p><strong>👤 ผู้จอง:</strong> {booking.name}</p>
            <p><strong>📞 เบอร์โทร:</strong> {booking.user_phone}</p>
            <p><strong>🚗 คนขับ:</strong> {booking.driver ? booking.driverid : "ยังไม่มีคนขับ"}</p>
            <p><strong>📌 สถานะ:</strong> {booking.status}</p>
            <p><strong>💰 ค่าบริการ:</strong> {booking.total_price} บาท</p>
            <p><strong>📅 วันที่:</strong> {new Date(booking.createdAt).toLocaleString()}</p>

            ✅ แสดงรูปภาพ
            <h2 className="text-lg font-bold mt-4">📸 รูปภาพที่อัปโหลด</h2>
            <div className="flex flex-wrap mt-2">
              {images.length > 0 ? (
                images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000${img.imageUrl}`}
                    alt={`booking-${index}`}
                    className="w-40 h-40 object-cover m-2 rounded shadow"
                  />
                ))
              ) : (
                <p className="text-gray-500">❌ ไม่มีรูปภาพ</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
