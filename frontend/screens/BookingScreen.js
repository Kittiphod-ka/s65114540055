import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingScreen = ({ navigation, route }) => {
  const [form, setForm] = useState({
    name: '',
    user_id: '',
    user_phone: '',
    vehicle_type: '',
    vehicle_model: '',
    license_plate: '',
    pickup_location: null,
    dropoff_location: null,
    note: '',
    distance: 0,
    price: 0,
    service_fee: 100,
    total_price: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedUserId = await AsyncStorage.getItem('user_id');
      const storedPhone = await AsyncStorage.getItem('user_phone');

      if (!storedUserId || storedUserId === "null") {
        Alert.alert('กรุณาล็อกอินใหม่', 'ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินอีกครั้ง');
        await AsyncStorage.clear();
        navigation.navigate('Login');
        return;
      }

      setForm((prev) => ({
        ...prev,
        name: storedUsername || '',
        user_id: storedUserId,
        user_phone: storedPhone || '',
      }));
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (route.params) {
      const { locationType, selectedLocation, distance } = route.params;
      setForm((prev) => ({
        ...prev,
        [locationType === 'pickup' ? 'pickup_location' : 'dropoff_location']: selectedLocation,
        distance: distance ?? prev.distance,
      }));
    }
  }, [route.params]);

  useEffect(() => {
    if (form.pickup_location && form.dropoff_location && form.distance > 0) {
      let price = 1500;

      if (form.distance > 50) {
        price = 3500 + (form.distance - 50) * 25;
      } else if (form.distance > 40) {
        price = 3500;
      } else if (form.distance > 30) {
        price = 3000;
      } else if (form.distance > 20) {
        price = 2500;
      } else if (form.distance > 10) {
        price = 2000;
      }

      setForm((prev) => ({
        ...prev,
        price: Math.round(price), 
        total_price: Math.round(price + prev.service_fee),
      }));
    }
  }, [form.distance]);

  const handleConfirmBooking = async () => {
    if (!form.vehicle_type || !form.pickup_location || !form.dropoff_location || !form.user_id) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
  
    try {
      console.log("📢 กำลังสร้างลิงก์ชำระเงิน...");
  
      const response = await axios.post("http://10.0.2.2:30055/api/payment/create-payment-link", {
        amount: form.total_price,
        bookingData: form,
      });
  
      if (response.data.url) {
        console.log("✅ ลิงก์ชำระเงินที่สร้าง:", response.data.url);
        
        // ✅ ส่ง URL ไปยัง `PaymentScreen`
        navigation.navigate("PaymentScreen", { paymentUrl: response.data.url, bookingId: response.data._id });
  
      } else {
        Alert.alert("❌ ข้อผิดพลาด", "ไม่สามารถสร้างลิงก์ชำระเงินได้");
      }
    } catch (error) {
      console.error("❌ Error creating payment link:", error.response?.data || error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถสร้างลิงก์ชำระเงินได้");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>เรียกรถ</Text>

      {/* ประเภทของรถ */}
      <View style={styles.vehicleSelection}>
        {['รถยนต์ 4 ล้อ', 'รถจักรยานยนต์', 'รถบรรทุก'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.vehicleOption, form.vehicle_type === type && styles.selectedOption]}
            onPress={() => setForm((prev) => ({ ...prev, vehicle_type: type }))}
          >
            <Text>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ฟอร์มกรอกข้อมูล */}
      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="ชื่อ-สกุล" value={form.name} editable={false} />
        <TextInput
          style={styles.input}
          placeholder="หมายเลขโทรศัพท์"
          value={form.user_phone}
          onChangeText={(value) => setForm((prev) => ({ ...prev, user_phone: value }))} />
        <TextInput
          style={styles.input}
          placeholder="รุ่นรถ"
          value={form.vehicle_model}
          onChangeText={(value) => setForm((prev) => ({ ...prev, vehicle_model: value }))} />
        <TextInput
          style={styles.input}
          placeholder="ทะเบียนรถ"
          value={form.license_plate}
          onChangeText={(value) => setForm((prev) => ({ ...prev, license_plate: value }))} />
      </View>

      {/* เลือกสถานที่ไปรับและไปส่ง */}
      <View style={styles.locationContainer}>
        <TouchableOpacity
          style={styles.locationBox}
          onPress={() => navigation.navigate('MapSelectScreen', {
            locationType: 'pickup',
            previousScreen: 'BookingScreen',
            existingPickup: form.pickup_location,
            existingDropoff: form.dropoff_location,
          })}
        >
          <Text>สถานที่ไปรับ: {form.pickup_location ? `${form.pickup_location.latitude}, ${form.pickup_location.longitude}` : 'ยังไม่เลือก'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationBox}
          onPress={() => navigation.navigate('MapSelectScreen', {
            locationType: 'dropoff',
            previousScreen: 'BookingScreen',
            existingPickup: form.pickup_location,
            existingDropoff: form.dropoff_location,
          })}
        >
          <Text>สถานที่ไปส่ง: {form.dropoff_location ? `${form.dropoff_location.latitude}, ${form.dropoff_location.longitude}` : 'ยังไม่เลือก'}</Text>
        </TouchableOpacity>
      </View>

      {/* หมายเหตุ */}
      <TextInput
        style={styles.input}
        placeholder="หมายเหตุ"
        value={form.note}
        onChangeText={(value) => setForm((prev) => ({ ...prev, note: value }))} />

      {/* สรุปค่าใช้จ่าย */}
      <View style={styles.summary}>
        <Text>ระยะทาง: {form.distance.toFixed(2)} กม.</Text>
        <Text>ค่าบริการ: {form.service_fee} บาท</Text>
        <Text>ราคาสุทธิ: {form.total_price} บาท</Text>
      </View>

      {/* ปุ่มไปชำระเงิน */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.buttonText}>ไปชำระเงิน</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E0F7FA' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  vehicleSelection: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  vehicleOption: { padding: 10, borderWidth: 1, borderRadius: 10, backgroundColor: '#F5F5F5' },
  selectedOption: { backgroundColor: '#AED581' },
  formContainer: { marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  locationContainer: { marginBottom: 10 },
  locationBox: { padding: 15, borderWidth: 1, borderColor: '#BDBDBD', borderRadius: 5, marginBottom: 10 },
  summary: { padding: 15, borderTopWidth: 1, borderColor: '#ddd' },
  confirmButton: { backgroundColor: '#FF4081', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
