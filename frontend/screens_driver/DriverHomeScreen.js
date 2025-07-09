import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BottomNavigationMenu from "../components/BottomNavigationMenu";

export default function DriverHomeScreen({ navigation }) {
  const [username, setUsername] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [status, setStatus] = useState("off"); // ✅ เริ่มต้นเป็นปิดรับงาน

  useEffect(() => {
    fetchDriverInfo();
  }, []);

  const fetchDriverInfo = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const storedDriverId = await AsyncStorage.getItem("driver_id");

      console.log("📡 โหลดข้อมูลจาก AsyncStorage...");
      console.log("📌 driver_id:", storedDriverId);
      console.log("📌 username:", storedUsername);

      if (storedUsername) setUsername(storedUsername);
      if (storedDriverId) {
        setDriverId(storedDriverId);

        // ✅ ดึงสถานะ on/off จาก API
        const response = await axios.get(`http://10.0.2.2:5000/api/drivers/status/${storedDriverId}`);
        if (response.data && response.data.status) {
          setStatus(response.data.status);
          await AsyncStorage.setItem("driver_status", response.data.status);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching driver data:", error);
    }
  };

  // ✅ เปิด-ปิดสถานะการรับงาน
  const toggleAvailability = async () => {
    try {
      const storedDriverId = await AsyncStorage.getItem("driver_id");
      console.log("📡 driver_id ที่ดึงมา:", storedDriverId);

      if (!storedDriverId) {
        Alert.alert("❌ ไม่พบข้อมูลคนขับ", "กรุณาล็อกอินใหม่");
        return;
      }

      const newStatus = status === "on" ? "off" : "on";
      setStatus(newStatus);

      console.log(`📡 กำลังอัปเดตสถานะเป็น ${newStatus}...`);

      const response = await axios.post("http://10.0.2.2:5000/api/drivers/update-status", {  
        driver_id: storedDriverId,  
        status: newStatus,
      });

      console.log("✅ API ตอบกลับ:", response.data);

      if (response.status === 200) {
        await AsyncStorage.setItem("driver_status", newStatus); // ✅ อัปเดต AsyncStorage
        Alert.alert(
          "📢 อัปเดตสถานะ",
          newStatus === "on" ? "✅ เปิดรับงานแล้ว" : "❌ ปิดรับงาน",
          [{ text: "ตกลง" }]
        );
      } else {
        console.error("❌ Error updating status: Unexpected response", response);
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: "https://media.istockphoto.com/id/1299412112/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B9%84%E0%B8%AD%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%81%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%A1%E0%B8%99%E0%B8%B8%E0%B8%A9%E0%B8%A2%E0%B9%8C-%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%A2%E0%B9%80%E0%B8%87%E0%B8%B2%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%84%E0%B8%9F%E0%B8%A5%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%84%E0%B8%84%E0%B8%A5-%E0%B8%AA%E0%B8%B1%E0%B8%8D%E0%B8%A5%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%93%E0%B9%8C%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%83%E0%B8%9A%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%B8%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-%E0%B9%82.jpg?s=170667a&w=0&k=20&c=kmK23ZCtUWK83SCm7U6BwlFTVd-CSkPBFu01dp9744I=" }} style={styles.profileImage} />
        {username ? (
          <Text style={styles.headerText}>สวัสดี, {username}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("DriverHomeScreen")}>
            <Text style={styles.headerText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* เปิด-ปิดรับงาน */}
      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[styles.statusBox, status === "on" ? styles.available : styles.notAvailable]}
          onPress={toggleAvailability}
        >
          <Text style={styles.buttonText}>{status === "on" ? "🟢 เปิดรับงาน" : "🔴 ปิดรับงาน"}</Text>
        </TouchableOpacity>
      </View>

      {/* รูปภาพตัวอย่าง */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: "https://scontent.fbkk8-4.fna.fbcdn.net/v/t39.30808-6/478189782_1124389519698222_4618971716219222022_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeESyS3VI4LOh1LSzY7zcfci6o6I_t0JyBzqjoj-3QnIHFSXp-sqCj5Febzl-VLRtQsl0DPchU0R_j7IJiQ_Toaa&_nc_ohc=c-tQ5e-UK5IQ7kNvgFSy-Wm&_nc_oc=Adi1VAFVujLXXfV6U5_m9Iyu12q9u8jIh7T9yxBuTVBBacYFtMe24kjQFbB5sRtYJbE&_nc_zt=23&_nc_ht=scontent.fbkk8-4.fna&_nc_gid=AhbK4ByocQ-c_b7Pt6vdBux&oh=00_AYAZLwjWUPjqeUlYx964IHQWW9FtP8Z8EGpYFMWF1IXVYQ&oe=67CB9105" }} style={styles.mainImage} />
      </View>

      {/* บริการ */}
      <Text style={styles.sectionTitle}>บริการ</Text>
      <View style={styles.serviceContainer}>
        <TouchableOpacity style={styles.serviceBox} onPress={() => navigation.navigate("DriverOrderListScreen")}>
          <Image source={{ uri: "https://img.lovepik.com/png/20231021/Flat-car-mechanic-car-beauty-gear-people_285276_wh1200.png" }} style={styles.icon} />
          <Text style={styles.serviceText}>รายการงาน</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Menu */}
      <BottomNavigationMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F7FA", padding: 10 },
  header: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  headerText: { fontSize: 24, fontWeight: "bold" },
  statusContainer: { alignItems: "center", marginVertical: 10 },
  statusBox: {
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    elevation: 3,
  },
  available: { backgroundColor: "#4CAF50" }, // ✅ สีเขียว เปิดรับงาน
  notAvailable: { backgroundColor: "#F44336" }, // ❌ สีแดง ปิดรับงาน
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  imageContainer: { alignItems: "center", marginVertical: 10 },
  mainImage: { width: "100%", height: 150, borderRadius: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  serviceContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  serviceBox: { alignItems: "center", padding: 10 },
  icon: { width: 50, height: 50 },
  serviceText: { marginTop: 5, fontSize: 16 },
});
