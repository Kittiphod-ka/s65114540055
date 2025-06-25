import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function UserOrderSummaryScreen({ route }) {
  const { bookingData } = route.params;
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // 🔥 เก็บรูปที่กดเพื่อเปิดเต็มจอ

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`http://26.120.17.211:5000/api/booking-images/${bookingData._id}`);
      console.log("📸 รูปที่ดึงมา:", response.data); 
      setImages(response.data);
    } catch (error) {
      console.error("❌ Error fetching images:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 สรุปรายการงาน</Text>

      {/* ✅ รายละเอียดงานแบบ Card UI */}
      <View style={styles.card}>
        <Text style={styles.info}>🚗 <Text style={styles.bold}>งานหมายเลข:</Text> {bookingData._id}</Text>
        <Text style={styles.info}>📍 <Text style={styles.bold}>จุดรับ:</Text> {bookingData.pickup_location.latitude}, {bookingData.pickup_location.longitude}</Text>
        <Text style={styles.info}>📍 <Text style={styles.bold}>จุดส่ง:</Text> {bookingData.dropoff_location.latitude}, {bookingData.dropoff_location.longitude}</Text>
        <Text style={styles.info}>🛣️ <Text style={styles.bold}>ระยะทาง:</Text> {bookingData.distance.toFixed(1)} กม.</Text>
        <Text style={styles.info}>💰 <Text style={styles.bold}>ค่าจ้าง:</Text> {bookingData.total_price} บาท</Text>
        <Text style={styles.info}>📅 <Text style={styles.bold}>วันที่:</Text> {new Date(bookingData.createdAt).toLocaleString()}</Text>
        <Text style={styles.info}>📌 <Text style={styles.bold}>สถานะ:</Text> {bookingData.status}</Text>
        <Text style={styles.info}>📌 <Text style={styles.bold}>สถานะจัดส่ง:</Text> {bookingData.status2}</Text>
        <Text style={styles.info}>📝 <Text style={styles.bold}>หมายเหตุ:</Text> {bookingData.note}</Text>
      </View>

      {/* ✅ แสดงรูปภาพที่อัปโหลด */}
      <Text style={styles.subTitle}>📸 รูปภาพที่อัปโหลด</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
        {images.length > 0 ? (
          images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedImage(`http://26.120.17.211:5000${img.imageUrl}`)}>
              <Image source={{ uri: `http://26.120.17.211:5000${img.imageUrl}` }} style={styles.image} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noImageText}>ไม่มีรูปภาพ</Text>
        )}
      </ScrollView>

      {/* ✅ Modal แสดงรูปเต็มจอ */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  subTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#555" },
  
  card: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 12, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    marginBottom: 20 
  },
  info: { fontSize: 16, marginBottom: 8, color: "#444" },
  bold: { fontWeight: "bold", color: "#222" },

  imageContainer: { marginTop: 10 },
  image: { width: 120, height: 120, marginRight: 10, borderRadius: 10, borderWidth: 2, borderColor: "#ddd" },
  noImageText: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 10 },

  // ✅ สไตล์ Modal แสดงรูปเต็มจอ
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center"
  },
  fullImage: { width: "90%", height: "70%", resizeMode: "contain", borderRadius: 12 },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 10,
    borderRadius: 50
  },
  closeText: { fontSize: 18, color: "#fff", fontWeight: "bold" }
});
