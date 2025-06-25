import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Polyline } from "react-native-maps";
import BottomNavigationMenu from "../components/BottomNavigationMenu";
import * as Location from "expo-location";

export default function DriverOrderDetailScreen({ route, navigation }) {
  const { bookingData } = route.params;
  const [driverId, setDriverId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [status2, setStatus2] = useState(bookingData.status2 || "กำลังไปรับ");

  const notifiedPickup = useRef(false);
  const notifiedDropoff = useRef(false);
  const intervalId = useRef(null);

  useEffect(() => {
    fetchDriverId();
    fetchBookingStatus();
    startTrackingDriver();
    return () => clearInterval(intervalId.current);
  }, []);

  useEffect(() => {
    if (driverLocation) {
      setRouteCoords([]);
      fetchRoute(status2 === "กำลังไปรับ" ? bookingData.pickup_location : bookingData.dropoff_location);
    }
  }, [status2, driverLocation]);

  // ✅ โหลดสถานะล่าสุดจาก Database
  const fetchBookingStatus = async () => {
    try {
      const response = await axios.get(`http://26.120.17.211:5000/api/bookings/get-status2/${bookingData._id}`);
      
      if (response.data && response.data.status2) {
        console.log("🔄 โหลดสถานะล่าสุด:", response.data.status2);
        setStatus2(response.data.status2);
      }
    } catch (error) {
      console.error("❌ Error fetching booking status2:", error.response?.data || error);
    }
  };

  const fetchDriverId = async () => {
    const storedDriverId = await AsyncStorage.getItem("user_id");
    setDriverId(storedDriverId);
  };

  const updateDriverLocation = async () => {
    try {
      if (bookingData.status !== "กำลังดำเนินการ") return; // ✅ แสดงตำแหน่งเฉพาะตอน "กำลังดำเนินการ"
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("❌ กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ");
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setDriverLocation({ latitude, longitude });

      await axios.post("http://26.120.17.211:5000/api/bookings/update-driver-location", {
        bookingId: bookingData._id, 
        latitude,
        longitude,
        driverId,
      });

      checkArrival({ latitude, longitude });

    } catch (error) {
      console.error("❌ Error updating driver location:", error.response?.data || error);
    }
  };

  const fetchRoute = async (destination) => {
    try {
      if (!driverLocation) return;

      console.log(`📌 คำนวณเส้นทางไปที่: ${status2 === "กำลังไปรับ" ? "จุดรับ" : "จุดส่ง"}`);

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${driverLocation.longitude},${driverLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
      );

      if (response.data && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coordinates);
      }
    } catch (error) {
      console.error("❌ Error fetching route:", error);
    }
  };

  const handleAcceptOrder = async () => {
    if (!driverId) {
        Alert.alert("❌ ข้อผิดพลาด", "ไม่พบข้อมูลคนขับ กรุณาล็อกอินใหม่");
        return;
    }

    try {
        const response = await axios.post("http://26.120.17.211:5000/api/bookings/update-status", {
            _id: bookingData._id,
            status: "กำลังดำเนินการ",
            driver_id: driverId,
        });

        console.log("✅ อัปเดตสถานะรับงานสำเร็จ:", response.data);
        Alert.alert("✅ รับงานสำเร็จ", "คุณได้รับงานนี้แล้ว!");

        // ✅ อัปเดตสถานะใหม่ให้กับ UI
        navigation.reset({
            index: 0,
            routes: [{ name: "DriverOrderListScreen" }],
        });

    } catch (error) {
        console.error("❌ Error accepting order:", error);
        Alert.alert("❌ รับงานไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
};

const handleCancelOrder = async () => {
  if (!driverId) {
      Alert.alert("❌ ข้อผิดพลาด", "ไม่พบข้อมูลคนขับ กรุณาล็อกอินใหม่");
      return;
  }

  try {
      const response = await axios.post("http://26.120.17.211:5000/api/bookings/cancel-order", {
          _id: bookingData._id,
          status: "ยกเลิก",
          driver_id: driverId,
      });

      console.log("🚫 ยกเลิกงานสำเร็จ:", response.data);
      Alert.alert("🚫 ยกเลิกงานสำเร็จ", "คุณได้ยกเลิกงานนี้แล้ว!");

      navigation.reset({
          index: 0,
          routes: [{ name: "DriverOrderListScreen" }],
      });

  } catch (error) {
      console.error("❌ Error canceling order:", error);
      Alert.alert("❌ ยกเลิกงานไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
  }
};

  const checkArrival = async (driverPos) => {
    const target = status2 === "กำลังไปรับ" ? bookingData.pickup_location : bookingData.dropoff_location;
    const distance = getDistance(driverPos, target);

    if (distance < 100) {  
      if (status2 === "กำลังไปรับ" && !notifiedPickup.current) {
        notifiedPickup.current = true;
        Alert.alert("📌 คุณถึงจุดรับแล้ว!", "กำลังเดินทางไปยังจุดส่ง...");
        setStatus2("กำลังไปส่ง");

        await axios.post(`http://26.120.17.211:5000/api/bookings/update-status2`, {
          _id: bookingData._id,
          status2: "กำลังไปส่ง",
        });

        fetchRoute(bookingData.dropoff_location);
      } else if (status2 === "กำลังไปส่ง" && !notifiedDropoff.current) {
        notifiedDropoff.current = true;
        Alert.alert("✅ งานเสร็จสิ้น!", "คุณถึงจุดส่งแล้ว");

        await axios.post(`http://26.120.17.211:5000/api/bookings/update-status2`, {
          _id: bookingData._id,
          status2: "เสร็จสิ้น",
        });

        setStatus2("เสร็จสิ้น");
      }
    }
  };

  const startTrackingDriver = () => {
    intervalId.current = setInterval(updateDriverLocation, 5000);
  };

  const getDistance = (pos1, pos2) => {
    const R = 6371000;
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(pos1.latitude * (Math.PI / 180)) * Math.cos(pos2.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  //อันนี้ปิดไว้ใช้นำทางแบบเดิม ออกไป map
  const openGoogleMaps = () => {
    if (!driverLocation) {
        Alert.alert("❌ ไม่สามารถเปิดนำทาง", "ตำแหน่งของคุณยังไม่ถูกโหลด");
        return;
    }

    // ✅ เลือกตำแหน่งปลายทางตามสถานะงาน
    const destination = status2 === "กำลังไปรับ"
        ? `${bookingData.pickup_location.latitude},${bookingData.pickup_location.longitude}`
        : `${bookingData.dropoff_location.latitude},${bookingData.dropoff_location.longitude}`;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.latitude},${driverLocation.longitude}&destination=${destination}&travelmode=driving`;
    
    Linking.openURL(url);
  };

  // //อันนี้นำทางแบบในแอพ
  // const navigateToNavigationScreen = () => {
  //   navigation.navigate("NavigationScreen", {
  //       pickup: bookingData.pickup_location,
  //       dropoff: bookingData.dropoff_location
  //   });
  // };

  const handleCompleteOrder = async () => {
    await axios.post(`http://26.120.17.211:5000/api/bookings/update-status/:id`, {
      _id: bookingData._id,
      status: "เสร็จสิ้น",
      driver_id: driverId,
    });

    Alert.alert("✅ งานเสร็จสิ้น", "คุณทำงานนี้เสร็จเรียบร้อยแล้ว!");
    navigation.reset({
      index: 0,
      routes: [{ name: "DriverOrderListScreen" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* แสดงแผนที่ */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: bookingData.pickup_location.latitude,
          longitude: bookingData.pickup_location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={bookingData.pickup_location} title="จุดรับ" />
        <Marker coordinate={bookingData.dropoff_location} title="จุดส่ง" />
        {driverLocation && (
          <Marker coordinate={driverLocation} title="📍 ตำแหน่งคนขับ" pinColor="green" />
        )}

        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
      </MapView>

      {/* รายละเอียดงาน */}
      <View style={styles.detailContainer}>
        <Text style={styles.title}>🚗 งานขับรถ</Text>
        <Text style={styles.info}>📍 จุดรับ: {bookingData.pickup_location.latitude}, {bookingData.pickup_location.longitude || "ไม่ระบุ"}</Text>
        <Text style={styles.info}>📍 จุดส่ง: {bookingData.dropoff_location.latitude}, {bookingData.dropoff_location.longitude || "ไม่ระบุ"}</Text>
        <Text style={styles.info}>🛣️ ระยะทาง: {bookingData.distance.toFixed(1)} กม.</Text>
        <Text style={styles.info}>💰 ค่าจ้าง: {bookingData.total_price} บาท</Text>
        <Text style={styles.info}>📝 หมายเหตุ: {bookingData.note}</Text>

        {/* ข้อมูลลูกค้า */}
        <Text style={styles.title}>👤 ข้อมูลลูกค้า</Text>
        <Text style={styles.info}>👤 {bookingData.name}</Text>
        <Text style={styles.info}>📞 {bookingData.user_phone}</Text>

        {/* ปุ่มแสดงตามสถานะของงาน */}
        <View style={styles.buttonRow}>
          {bookingData.status === "รอคนขับรับงาน" && (
            <>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOrder}>
              <Text style={styles.buttonText}>✅ รับงาน</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <Text style={styles.buttonText}>🚫 ยกเลิกงาน</Text>
            </TouchableOpacity>
            </>
          )}

          {bookingData.status === "กำลังดำเนินการ" && (
            <>
              <TouchableOpacity style={styles.mapButton} onPress={openGoogleMaps}>
                <Text style={styles.buttonText}>🗺️ นำทาง</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.mapButton} onPress={navigateToNavigationScreen}>
                <Text style={styles.buttonText}>🗺️ นำทาง</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteOrder}>
                <Text style={styles.buttonText}>✅ ส่งงาน</Text>
              </TouchableOpacity>
            </>
          )}

          {bookingData.status === "เสร็จสิ้น" && (
            <TouchableOpacity 
            style={styles.summaryButton} 
            onPress={() => navigation.navigate("DriverOrderSummaryScreen", { bookingData })}
          >
            <Text style={styles.buttonText}>📋 ดูสรุปรายการ</Text>
          </TouchableOpacity>
          )}
        </View>
      </View>
    <BottomNavigationMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  map: { width: "100%", height: "50%" },
  detailContainer: { padding: 15, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5 },
  buttonRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  acceptButton: { flex: 1, backgroundColor: "#007bff", padding: 12, borderRadius: 10, alignItems: "center" },
  mapButton: { flex: 1, backgroundColor: "#17a2b8", padding: 12, borderRadius: 10, alignItems: "center", marginRight: 5 },
  completeButton: { flex: 1, backgroundColor: "#28a745", padding: 12, borderRadius: 10, alignItems: "center", marginLeft: 5 },
  summaryButton: { flex: 1, backgroundColor: "#ffc107", padding: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    flex: 1,
    backgroundColor: "#dc3545", // สีแดง
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 5,
  },
});