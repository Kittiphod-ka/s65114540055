import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavigationMenu from '../components/BottomNavigationMenu';

const TrackingScreen = () => {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSearch = () => {
    // ใส่ลอจิกสำหรับการค้นหาสถานะ
    console.log('Searching for tracking number:', trackingNumber);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ติดตามสถานะ</Text>
      </View>

      {/* ช่องกรอกข้อมูลและปุ่มค้นหา */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="กรอกหมายเลขติดตาม"
          value={trackingNumber}
          onChangeText={setTrackingNumber}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ขีดคั่นระหว่างข้อมูล */}
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#00bfff',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00bfff',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  searchButton: {
    backgroundColor: '#FF5722',
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 20,
    marginHorizontal: 20,
  },
});

export default TrackingScreen;
