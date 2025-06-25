import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function BookingSuccessScreen({ navigation, route }) {
  const { bookingId } = route.params;

  useEffect(() => {
    const savePaymentStatus = async () => {
      try {
        console.log("📢 บันทึกการชำระเงินสำหรับ Booking ID:", bookingId);
        const response = await axios.post("http://26.120.17.211:5000/api/bookings/update-payment", {
          bookingId,
          status: "paid",
        });

        if (response.data.success) {
          Alert.alert("สำเร็จ", "บันทึกการชำระเงินเรียบร้อยแล้ว");
          navigation.replace("Home"); // 🔥 กลับไปหน้าแรก
        } else {
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกการชำระเงินได้");
        }
      } catch (error) {
        console.error("❌ Error updating payment:", error);
        Alert.alert("เกิดข้อผิดพลาด", "เกิดปัญหาขณะบันทึกการชำระเงิน");
      }
    };

    savePaymentStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>กำลังบันทึกการชำระเงิน...</Text>
      <ActivityIndicator size="large" color="#FF4081" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
});
