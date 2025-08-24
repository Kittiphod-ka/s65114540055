import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BottomNavigationMenu from '../components/BottomNavigationMenu';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log("🔍 Token ที่เก็บไว้:", token);
      if (!token) {
        Alert.alert("❌ กรุณาล็อกอินใหม่", "ไม่พบ Token หรือหมดอายุ");
        navigation.navigate("LoginScreen");
      }
    };
    checkToken();
  }, []);
  
  const handleProtectedRoute = async (screen) => {
    if (!username) {
      Alert.alert('กรุณาล็อกอินก่อน', 'คุณต้องเข้าสู่ระบบเพื่อใช้งานส่วนนี้', [
        { text: 'ตกลง', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (screen === "BookingScreen") {
      const canProceed = await checkDriverAvailability();
      if (!canProceed) return;
    }

    navigation.navigate(screen);
  };


  
 

const checkDriverAvailability = async () => {
    try {
        console.log("📡 กำลังตรวจสอบสถานะคนขับ...");

        // 🔑 ดึง Token จาก AsyncStorage
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            Alert.alert("❌ ไม่ได้รับอนุญาต", "กรุณาเข้าสู่ระบบใหม่");
            navigation.navigate("LoginScreen");
            return false;
        }

        // ✅ ส่ง Authorization Header
        const headers = { Authorization: `Bearer ${token}` };

        // ✅ ตรวจสอบ API ของคนขับที่เปิดรับงาน
        const driversResponse = await axios.get("http://10.0.2.2:30055/api/drivers/available", { headers });
        const availableDrivers = driversResponse.data;
        console.log("✅ คนขับที่เปิดรับงาน:", availableDrivers);

        if (!availableDrivers || availableDrivers.length === 0) {
            Alert.alert("❌ ยังไม่พร้อมให้บริการ", "ขณะนี้ไม่มีคนขับที่พร้อมให้บริการ");
            return false;
        }

        // ✅ ตรวจสอบ API ของงานที่กำลังดำเนินการ
        const bookingsResponse = await axios.get("http://10.0.2.2:30055/api/bookings/active", { headers });
        const activeBookings = bookingsResponse.data;
        console.log("✅ งานที่กำลังดำเนินการ:", activeBookings);

        // ✅ คำนวณจำนวนคนขับที่ติดงานอยู่
        const busyDrivers = availableDrivers.filter(driver =>
            activeBookings.some(booking => booking.driver_id === driver._id)
        );

        const busyPercentage = (busyDrivers.length / availableDrivers.length) * 100;
        console.log(`📊 เปอร์เซ็นต์คนขับที่ติดงาน: ${busyPercentage}%`);

        // ✅ แจ้งเตือนถ้ามีคนขับมากกว่า 80% ติดงาน
        if (busyPercentage >= 80) {
            Alert.alert(
                "⚠️ คนขับอาจไม่ว่าง", 
                "มีคนขับที่กำลังติดงานมากกว่าปกติ อาจมีความล่าช้า\nคุณต้องการเรียกรถต่อหรือไม่?",
                [
                    { text: "ยกเลิก", style: "cancel" },
                    { text: "ตกลง", onPress: () => navigation.navigate("BookingScreen") }
                ]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error("❌ Error checking driver availability:", error.response?.data || error);
        Alert.alert("❌ ข้อผิดพลาด", "ไม่สามารถตรวจสอบสถานะของคนขับได้");
        return false;
    }
};




  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://media.istockphoto.com/id/1299412112/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B9%84%E0%B8%AD%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%81%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%A1%E0%B8%99%E0%B8%B8%E0%B8%A9%E0%B8%A2%E0%B9%8C-%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%A2%E0%B9%80%E0%B8%87%E0%B8%B2%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%84%E0%B8%9F%E0%B8%A5%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%84%E0%B8%84%E0%B8%A5-%E0%B8%AA%E0%B8%B1%E0%B8%8D%E0%B8%A5%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%93%E0%B9%8C%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%83%E0%B8%9A%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%B8%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-%E0%B9%82.jpg?s=170667a&w=0&k=20&c=kmK23ZCtUWK83SCm7U6BwlFTVd-CSkPBFu01dp9744I=' }}
          style={styles.profileImage}
        />
        {username ? (
          <Text style={styles.headerText}>สวัสดี, {username}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.headerText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ติดตามสถานะ */}
      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={styles.statusBox}
          onPress={() => navigation.navigate('TrackingScreen')}
        >
          <Text style={styles.buttonText}>ติดตามสถานะ</Text>
        </TouchableOpacity>
      </View>

      {/* รูปภาพตัวอย่าง */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://scontent.fbkk8-4.fna.fbcdn.net/v/t39.30808-6/478189782_1124389519698222_4618971716219222022_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeESyS3VI4LOh1LSzY7zcfci6o6I_t0JyBzqjoj-3QnIHFSXp-sqCj5Febzl-VLRtQsl0DPchU0R_j7IJiQ_Toaa&_nc_ohc=c-tQ5e-UK5IQ7kNvgFSy-Wm&_nc_oc=Adi1VAFVujLXXfV6U5_m9Iyu12q9u8jIh7T9yxBuTVBBacYFtMe24kjQFbB5sRtYJbE&_nc_zt=23&_nc_ht=scontent.fbkk8-4.fna&_nc_gid=AhbK4ByocQ-c_b7Pt6vdBux&oh=00_AYAZLwjWUPjqeUlYx964IHQWW9FtP8Z8EGpYFMWF1IXVYQ&oe=67CB9105' }}
          style={styles.mainImage}
        />
      </View>

      {/* บริการ */}
      <Text style={styles.sectionTitle}>บริการ</Text>
      <View style={styles.serviceContainer}>
        <TouchableOpacity style={styles.serviceBox} onPress={() => handleProtectedRoute('BookingScreen')}>
          <Image
            source={{ uri: 'https://img.lovepik.com/png/20231021/Flat-car-mechanic-car-beauty-gear-people_285276_wh1200.png' }}
            style={styles.icon}
          />
          <Text style={styles.serviceText}>เรียกรถ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceBox} onPress={() => handleProtectedRoute('PriceCalculator')}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/93/9d/85/939d859cb2265536414792d9db266235.jpg' }}
            style={styles.icon}
          />
          <Text style={styles.serviceText}>คำนวณราคา</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Menu */}
      <BottomNavigationMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7FA', padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  statusContainer: { alignItems: 'center', marginVertical: 10 },
  statusBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
  },
  imageContainer: { alignItems: 'center', marginVertical: 10 },
  mainImage: { width: '100%', height: 150, borderRadius: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  serviceContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  serviceBox: { alignItems: 'center', padding: 10 },
  icon: { width: 50, height: 50 },
  serviceText: { marginTop: 5, fontSize: 16 },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  menuText: { fontSize: 16, fontWeight: 'bold' },
});
