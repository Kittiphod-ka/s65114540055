import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BottomNavigationMenu() {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await AsyncStorage.getItem("role");
      setRole(userRole);
    };
    fetchRole();
  }, []);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.menuContainer}>
      {/* 🔥 เมนูแยกตาม Role */}
      {role === "driver" ? (
        <>
          <TouchableOpacity onPress={() => handleNavigate("DriverHomeScreen")}>
            <Text style={styles.menuText}>หน้าหลัก</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate("DriverOrderListScreen")}>
            <Text style={styles.menuText}>ออเดอร์</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => handleNavigate("HomeScreen")}>
            <Text style={styles.menuText}>หน้าหลัก</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate("OrderListScreen")}>
            <Text style={styles.menuText}>รายการ</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 🔥 เมนูที่ใช้ร่วมกัน */}
      {/* <TouchableOpacity onPress={() => handleNavigate("MessagesScreen")}>
        <Text style={styles.menuText}>ข้อความ</Text>
      </TouchableOpacity> */}
      <TouchableOpacity onPress={() => handleNavigate("SettingsScreen")}>
        <Text style={styles.menuText}>ตั้งค่า</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
