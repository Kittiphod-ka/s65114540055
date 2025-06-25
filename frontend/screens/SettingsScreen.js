import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigationMenu from '../components/BottomNavigationMenu';

export default function SettingsScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  // โหลดข้อมูล username และ id จาก AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedUserId = await AsyncStorage.getItem('id'); // ดึง ID จาก AsyncStorage
      if (storedUsername) setUsername(storedUsername);
      if (storedUserId) setUserId(storedUserId);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ตกลง',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* ส่วนหัวโปรไฟล์ */}
      <View style={styles.header}>
        <View style={styles.profileImage} />
        <Text style={styles.profileName}>สวัสดี! {username || 'Guest'}</Text>
        <Text style={styles.profileID}>ID : {userId || 'N/A'}</Text>
      </View>

      {/* การตั้งค่าบัญชี */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ตั้งค่าบัญชี</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ProfileScreen')}>
          <Text style={styles.optionText}>ตั้งค่าโปรไฟล์</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>บัญชีและความปลอดภัย</Text>
        </TouchableOpacity>
      </View>

      {/* การตั้งค่าทั่วไป */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ตั้งค่าทั่วไป</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>ภาษา / Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>การแจ้งเตือน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>ความช่วยเหลือ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>เกี่ยวกับ</Text>
        </TouchableOpacity>
      </View>

      {/* ปุ่มออกจากระบบ */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>

      {/* Navigation Menu */}
      <BottomNavigationMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    backgroundColor: '#00BFFF',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  profileName: { fontSize: 22, color: '#FFF', fontWeight: 'bold' },
  profileID: { fontSize: 16, color: '#FFF' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  option: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 5,
    elevation: 1,
  },
  optionText: { fontSize: 16, color: '#333' },
  logoutButton: {
    marginVertical: 20,
    marginHorizontal: 20,
    backgroundColor: '#D3D3D3',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  logoutText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
});
