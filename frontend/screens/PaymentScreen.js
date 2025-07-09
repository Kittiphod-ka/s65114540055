import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentScreen = ({ route }) => {
  const { paymentUrl, bookingId } = route.params || {};
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [urlLoaded, setUrlLoaded] = useState(false); // ✅ ป้องกันโหลด WebView ซ้ำซ้อน

  useEffect(() => {
    if (!paymentUrl) {
      Alert.alert("❌ ข้อผิดพลาด", "ไม่พบ URL การชำระเงิน");
      navigation.goBack(); // ✅ ถ้าไม่มี URL ให้กลับไปหน้าก่อนหน้า
      return;
    }

    setUrlLoaded(true);
  }, [paymentUrl]);

  const handleWebViewNavigation = (event) => {
    const { url } = event;
    console.log("📢 ตรวจจับ URL:", url);

    if (url.includes("payment-success")) {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const _id = urlParams.get("_id"); // ✅ ดึง `_id` จาก URL

        console.log("✅ _id ที่ได้รับ:", _id);

        if (_id && _id !== "undefined") {  // ✅ เช็คว่า `_id` มีค่า
            confirmPayment(_id);
        } else {
            Alert.alert("❌ ไม่พบข้อมูล", "ไม่สามารถยืนยันการชำระเงินได้");
        }
    }
};

const confirmPayment = async (_id) => {
    try {
        const token = await AsyncStorage.getItem("token");

        await axios.post(
            "http://10.0.2.2:5000/api/payment/confirm-payment",
            { _id }, // ✅ ส่ง `_id` ไปอัปเดตฐานข้อมูล
            { headers: { Authorization: `Bearer ${token}` } }
        );

        Alert.alert("✅ ชำระเงินสำเร็จ!", "การจองของคุณได้รับการยืนยันแล้ว");
        navigation.navigate("HomeScreen"); // ✅ กลับไปหน้า Home
    } catch (error) {
        console.error("❌ Error updating booking:", error);
        Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตการชำระเงินได้");
    }
};

  return (
    <View style={{ flex: 1 }}>
      {urlLoaded ? (
        <WebView
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onNavigationStateChange={handleWebViewNavigation}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF4081" />
          <Text>กำลังโหลดหน้าชำระเงิน...</Text>
        </View>
      )}
    </View>
  );
};

export default PaymentScreen;
