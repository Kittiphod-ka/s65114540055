import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import BottomNavigationMenu from "../components/BottomNavigationMenu";

const TrackingDetailScreen = ({ route, navigation }) => {
  const { bookingData } = route.params;
  const [routeCoords, setRouteCoords] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState(bookingData.status2 || "กำลังไปรับ");
  const intervalId = useRef(null);

  useEffect(() => {
    if (bookingData.status === "กำลังดำเนินการ") {
      fetchRoute(trackingStatus === "กำลังไปรับ" ? bookingData.pickup_location : bookingData.dropoff_location);
      startTrackingDriver();
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, []);

  useEffect(() => {
    if (driverLocation && bookingData.status === "กำลังดำเนินการ") {
      fetchRoute(trackingStatus === "กำลังไปรับ" ? bookingData.pickup_location : bookingData.dropoff_location);
    }
  }, [trackingStatus, driverLocation]);

  const fetchRoute = async (destination) => {
    try {
      if (!driverLocation) return;

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${driverLocation.longitude},${driverLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
      );

      if (response.data && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude
        }));
        setRouteCoords(coordinates);
      }
    } catch (error) {
      console.error("❌ Error fetching route:", error);
    }
  };

  const fetchDriverLocation = async () => {
    try {
      if (bookingData.status !== "กำลังดำเนินการ") return;

      const response = await axios.get(`http://10.0.2.2:5000/api/bookings/driver-location/${bookingData._id}`);

      if (response.data && response.data.latitude && response.data.longitude) {
        setDriverLocation(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching driver location:", error);
    }
  };

  const startTrackingDriver = () => {
    intervalId.current = setInterval(fetchDriverLocation, 5000);
  };

  return (
    <View style={styles.container}>
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
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
        {driverLocation && <Marker coordinate={driverLocation} title="ตำแหน่งคนขับ" pinColor="green" />}
      </MapView>

      <View style={styles.detailContainer}>
        <Text style={styles.driverName}>🚗 รถ {bookingData.vehicle_type}</Text>
        <Text style={styles.driverText}>👤 คนขับ: {bookingData.driver_id || "ไม่ระบุ"}</Text>
        <Text style={styles.driverText}>📞 เบอร์โทร: {bookingData.driver_phone || "ไม่ระบุ"}</Text>

        {/* ✅ ปุ่มโทรขนาดเต็มแถว */}
        <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${bookingData.driver_phone}`)}>
          <Text style={styles.buttonText}>📞 โทรหาคนขับ</Text>
        </TouchableOpacity>

        <Text style={styles.detailText}>📍 จุดรับ: {bookingData.pickup_location.latitude}, {bookingData.pickup_location.longitude}</Text>
        <Text style={styles.detailText}>📍 จุดส่ง: {bookingData.dropoff_location.latitude}, {bookingData.dropoff_location.longitude}</Text>
        <Text style={styles.detailText}>🛣️ ระยะทาง: {Math.round(bookingData.distance)} กม.</Text>

        <Text style={styles.noteText}>📝 หมายเหตุ: {bookingData.note}</Text>

        {/* ✅ ปุ่มดูสรุปรายการขนาดเต็มแถว */}
        <TouchableOpacity 
          style={styles.summaryButton} 
          onPress={() => navigation.navigate("UserOrderSummaryScreen", { bookingData })}
        >
          <Text style={styles.summaryText}>📋 ดูสรุปรายการ</Text>
        </TouchableOpacity>
      </View>

      <BottomNavigationMenu />
    </View>
  );
};

// ✅ สไตล์ UI
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#00BFFF" },
  map: { width: "100%", height: "50%" },
  detailContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 60,
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  driverName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  driverText: { fontSize: 16, color: "#fff", marginTop: 5 },
  callButton: { 
    backgroundColor: "#ff4444", 
    padding: 12, 
    borderRadius: 10, 
    alignItems: "center",
    width: "100%", // ✅ ทำให้เต็มความกว้าง
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  detailText: { fontSize: 14, color: "#fff", marginVertical: 6 },
  noteText: { fontSize: 14, color: "#fff", fontStyle: "italic", marginBottom: 12 },
  summaryButton: { 
    marginTop: 15, 
    padding: 12, 
    backgroundColor: "#ff4081", 
    borderRadius: 10, 
    alignItems: "center",
    width: "100%", // ✅ ปุ่มดูสรุปรายการขนาดเต็มแถว
  },
  summaryText: { color: "#fff", fontWeight: "bold" },
});

export default TrackingDetailScreen;
