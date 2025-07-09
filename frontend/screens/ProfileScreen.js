import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState('');

  // โหลดข้อมูลผู้ใช้จาก Database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token); // ตรวจสอบ Token
  
        const response = await axios.get('http://10.255.67.10:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Response:', response.data); // ตรวจสอบ Response ที่ได้จาก Backend
  
        const { username, email, phone, profile } = response.data;
        setUsername(username || '');
        setEmail(email || '');
        setPhone(phone || '');
        setProfile(profile || '');
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }
    };
  
    fetchUserProfile();
  }, []);

  // ฟังก์ชันบันทึกข้อมูลที่แก้ไข
  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Sending Data:', { email, phone, profile }); // ตรวจสอบข้อมูลที่ส่งไป
      console.log('Token:', token); // ตรวจสอบ Token
  
      const response = await axios.put(
        'http://10.0.2.2:5000/api/profile',
        { email, phone, profile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Response:', response.data); // ตรวจสอบ Response ที่ได้จาก Backend
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>โปรไฟล์ของฉัน</Text>

      {/* Username (Read-Only) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} editable={false} />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      {/* Phone */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
      </View>

      {/* Profile */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Profile</Text>
        <TextInput
          style={styles.input}
          value={profile}
          onChangeText={setProfile}
          placeholder="Profile"
        />
      </View>

      {/* Save Button */}
      <Button title="บันทึกข้อมูล" onPress={handleSaveProfile} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
  },
});
