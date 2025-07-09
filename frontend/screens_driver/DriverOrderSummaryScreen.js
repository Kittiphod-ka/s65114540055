import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function DriverOrderSummaryScreen({ route }) {
  const { bookingData } = route.params;
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/booking-images/${bookingData._id}`);
      console.log("📸 รูปที่ดึงมา:", response.data); // ✅ เช็คข้อมูลที่ดึงมา
      setImages(response.data);
    } catch (error) {
      console.error("❌ Error fetching images:", error);
    }
  };

  const handleUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("❌ Permission Denied", "กรุณาอนุญาตให้แอพเข้าถึงรูปภาพของคุณ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("bookingId", bookingData._id);
      formData.append("image", {
        uri: result.assets[0].uri,
        name: `booking-${bookingData._id}.jpg`,
        type: "image/jpeg",
      });

      try {
        const response = await axios.post("http://10.0.2.2:5000/api/booking-images/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Alert.alert("✅ อัปโหลดรูปสำเร็จ!");
        fetchImages(); // โหลดรูปใหม่
      } catch (error) {
        console.error("❌ Error uploading image:", error);
        Alert.alert("❌ อัปโหลดรูปไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ รายละเอียดงาน */}
      <Text style={styles.title}>📋 สรุปรายการงาน</Text>
      <Text style={styles.info}>🚗 งานหมายเลข: {bookingData._id}</Text>
      <Text style={styles.info}>📍 จุดรับ: {bookingData.pickup_location.latitude}, {bookingData.pickup_location.longitude}</Text>
      <Text style={styles.info}>📍 จุดส่ง: {bookingData.dropoff_location.latitude}, {bookingData.dropoff_location.longitude}</Text>
      <Text style={styles.info}>🛣️ ระยะทาง: {bookingData.distance.toFixed(1)} กม.</Text>
      <Text style={styles.info}>💰 ค่าจ้าง: {bookingData.total_price} บาท</Text>
      <Text style={styles.info}>📅 วันที่: {new Date(bookingData.createdAt).toLocaleString()}</Text>
      <Text style={styles.info}>📌 สถานะ: {bookingData.status}</Text>
      <Text style={styles.info}>📝 หมายเหตุ: {bookingData.note}</Text>

      {/* ✅ แสดงรูปภาพที่อัปโหลด */}
      <Text style={styles.subTitle}>📸 รูปภาพที่อัปโหลด</Text>
      <ScrollView horizontal>
        {images.length > 0 ? (
          images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: `http://10.0.2.2:5000/uploads/${img.imageUrl.replace("/uploads/", "")}` }}
              style={styles.image}
            />
          ))
        ) : (
          <Text style={styles.noImageText}>ไม่มีรูปภาพ</Text>
        )}
      </ScrollView>

      {/* ✅ ปุ่มอัปโหลดรูป */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
        <Text style={styles.buttonText}>📤 อัปโหลดรูปภาพ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  info: { fontSize: 16, marginBottom: 5 },
  image: { width: 300, height: 200, margin: 5, borderRadius: 10 },
  noImageText: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 10 },
  uploadButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, marginTop: 20, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
