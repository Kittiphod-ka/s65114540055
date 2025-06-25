import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PriceCalculator from '../screens/PriceCalculator';
import MapSelectScreen from '../screens/MapSelectScreen';
import BookingScreen from '../screens/BookingScreen';
import TrackingScreen from '../screens/TrackingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OrderListScreen from '../screens/OrderListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import TrackingDetailScreen from "../screens/TrackingDetailScreen";
import UserOrderSummaryScreen from '../screens/UserOrderSummaryScreen';

import DriverHomeScreen from "../screens_driver/DriverHomeScreen";
import DriverOrderListScreen from "../screens_driver/DriverOrderListScreen";
import DriverOrderDetailScreen from "../screens_driver/DriverOrderDetailScreen";
import NavigationScreen from "../screens_driver/NavigationScreen";
import DriverOrderSummaryScreen from "../screens_driver/DriverOrderSummaryScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('role');
        console.log("📢 ตรวจสอบ role:", role);
        if (role === 'driver') {
          setInitialRoute('DriverHomeScreen'); // คนขับ
        } else if (role === 'user') {
          setInitialRoute('HomeScreen'); // ผู้ใช้
        } else {
          setInitialRoute('LoginScreen'); // ถ้าไม่มี role ให้ไปหน้า Login
        }
      } catch (error) {
        console.error("❌ Error checking role:", error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log("📢 ได้รับ URL:", url);
      if (url.includes("payment-success")) {
        const bookingId = url.split("bookingId=")[1];
        console.log("✅ Booking ID:", bookingId);
        if (bookingId) {
          setInitialRoute('HomeScreen'); // ✅ กลับไปหน้า Home หลังชำระเงินสำเร็จ
        }
      }
    };

    // ✅ ใช้วิธีใหม่ของ Linking.addEventListener()
    const subscription = Linking.addEventListener("change", handleDeepLink);

    return () => {
      subscription.remove(); // ✅ ใช้ remove() แทน removeEventListener()
    };
  }, []);

  if (!initialRoute) {
    return null; // ✅ รอให้ AsyncStorage ดึงค่าเสร็จ ก่อนโหลด Navigator
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="PriceCalculator" component={PriceCalculator} />
        <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="TrackingScreen" component={TrackingScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="OrderListScreen" component={OrderListScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="BookingSuccessScreen" component={BookingSuccessScreen} />
        <Stack.Screen name="TrackingDetailScreen" component={TrackingDetailScreen} />
        <Stack.Screen name="UserOrderSummaryScreen" component={UserOrderSummaryScreen} />

        {/* ✅ หน้าของคนขับ */}
        <Stack.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
        <Stack.Screen name="DriverOrderListScreen" component={DriverOrderListScreen} />
        <Stack.Screen name="DriverOrderDetailScreen" component={DriverOrderDetailScreen} />
        <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
        <Stack.Screen name="DriverOrderSummaryScreen" component={DriverOrderSummaryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
