import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSignup = async () => {
    const { username, email, phone, password, confirmPassword } = form;

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://10.0.2.2:40055/api/auth/signup', {
        username,
        email,
        phone,
        password,
        profile: '', // สามารถอัปโหลดรูปในภายหลังได้
        role: 'user',
      });

      setMessage('Signup successful');
      navigation.navigate('LoginScreen');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>{'<'} </Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>สร้างบัญชี</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* ชื่อ */}
        <Text style={styles.label}>ชื่อ :</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกชื่อของคุณ"
          value={form.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />

        {/* อีเมล */}
        <Text style={styles.label}>อีเมล :</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอีเมลของคุณ"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />

        {/* เบอร์โทร */}
        <Text style={styles.label}>เบอร์โทร :</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกเบอร์โทร"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
        />

        {/* รหัสผ่าน */}
        <Text style={styles.label}>รหัสผ่าน :</Text>
        <TextInput
          style={styles.input}
          placeholder="*******"
          secureTextEntry
          value={form.password}
          onChangeText={(value) => handleInputChange('password', value)}
        />

        {/* ยืนยันรหัสผ่าน */}
        <Text style={styles.label}>ยืนยันรหัสผ่าน :</Text>
        <TextInput
          style={styles.input}
          placeholder="*******"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
        />

        {/* ปุ่มสมัคร */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>สร้างบัญชี</Text>
        </TouchableOpacity>

        {/* ข้อความแจ้งเตือน */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* ปุ่มไปที่ล็อกอิน */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>ไปที่หน้าล็อกอิน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerBack: {
    fontSize: 18,
    color: '#007AFF',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#B3E5FC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF4081',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  loginText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});
