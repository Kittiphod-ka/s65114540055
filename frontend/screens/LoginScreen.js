import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native"; // ✅ นำเข้า CommonActions

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      if (token && role) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: role === "driver" ? "DriverHomeScreen" : "HomeScreen" }],
          })
        );
      }
    };
    checkLogin();
  }, []);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://10.0.2.2:30055/api/auth/login", {
        username: form.username,
        password: form.password,
      });
  
      const { token, user } = res.data;
      if (token && user) {
        console.log("✅ Login สำเร็จ!");
        console.log("📌 user:", user);
  
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("username", user.username);
        await AsyncStorage.setItem("user_id", user.id);
        await AsyncStorage.setItem("user_phone", user.phone || "");
        await AsyncStorage.setItem("role", user.role);
  
        // ✅ ถ้าเป็น `driver` ให้เก็บ `driver_id`
        if (user.role === "driver") {
          console.log("🚗 ผู้ใช้เป็นคนขับ! เก็บ driver_id...");
          await AsyncStorage.setItem("driver_id", user.id); // ✅ ต้องใช้ user.id หรือ user.driver_id
        }
  
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: user.role === "driver" ? "DriverHomeScreen" : "HomeScreen" }],
          })
        );
      } else {
        setMessage("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Error logging in:", error);
      setMessage(error.response?.data?.message || "Login failed");
    }
  };
  
  


  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="person" size={24} color="#757575" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="ชื่อผู้ใช้ หรือ อีเมล"
          value={form.username}
          onChangeText={(value) => handleInputChange("username", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={24} color="#757575" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          secureTextEntry
          value={form.password}
          onChangeText={(value) => handleInputChange("password", value)}
        />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.signupText}>
        ไม่มีบัญชี?{" "}
        <Text style={styles.signupLink} onPress={() => navigation.navigate("Signup")}>
          สมัครสมาชิก
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20, justifyContent: "center" },
  backButton: { position: "absolute", top: 50, left: 20 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: "#333" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 12, marginBottom: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  message: { color: "red", fontSize: 14, textAlign: "center", marginBottom: 10 },
  loginButton: { backgroundColor: "#007AFF", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  loginButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  forgotPasswordText: { textAlign: "center", color: "#007AFF", fontSize: 14, marginTop: 10 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 20 },
  signupText: { textAlign: "center", fontSize: 16 },
  signupLink: { color: "#007AFF", fontWeight: "bold" },
});
