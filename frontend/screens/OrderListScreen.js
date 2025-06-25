import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BottomNavigationMenu from '../components/BottomNavigationMenu';

export default function OrderListScreen() {
    const [selectedTab, setSelectedTab] = useState('กำลังดำเนินการ'); // ค่าเริ่มต้น
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('user_id');
            if (!storedUserId) {
                Alert.alert("กรุณาล็อกอิน", "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
                return;
            }
            setUserId(storedUserId);

            // ✅ ดึงข้อมูลการจองที่เป็นของ userId
            console.log("📢 กำลังดึงข้อมูลออเดอร์ของ user_id:", storedUserId);
            const response = await axios.get(`http://26.120.17.211:5000/api/bookings/user/${storedUserId}`);

            console.log("✅ ข้อมูลที่ดึงมา:", response.data);
            setOrders(response.data);
        } catch (error) {
            console.error("❌ Error fetching orders:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรายการจองได้");
        } finally {
            setLoading(false);
        }
    };

    const handleOrderPress = (order) => {
        navigation.navigate("TrackingDetailScreen", { bookingData: order });
    };

    const renderTabContent = () => {
        if (loading) {
            return <Text style={styles.loadingText}>กำลังโหลด...</Text>;
        }

        // ✅ กรองข้อมูลตามสถานะที่เลือก
        const filteredOrders = orders.filter((order) => order.status === selectedTab);

        if (filteredOrders.length === 0) {
            return <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>;
        }

        return (
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => handleOrderPress(item)}>
                        <Text style={styles.cardTitle}>🚗 {item.vehicle_type}</Text>
                        <Text style={styles.cardText}>📍 รับ: {item.pickup_location.latitude}, {item.pickup_location.longitude}</Text>
                        <Text style={styles.cardText}>📍 ส่ง: {item.dropoff_location.latitude}, {item.dropoff_location.longitude}</Text>
                        <Text style={styles.cardText}>💰 ราคา: {item.total_price} บาท</Text>
                        <Text style={styles.cardStatus}>📌 สถานะ: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>รายการของฉัน</Text>
            </View>

            {/* Tab Menu */}
            <View style={styles.tabContainer}>
                {["รอคนขับรับงาน","กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.tab, selectedTab === status && styles.activeTab]}
                        onPress={() => setSelectedTab(status)}
                    >
                        <Text style={[styles.tabText, selectedTab === status && styles.activeTabText]}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <View style={styles.contentContainer}>{renderTabContent()}</View>
            <BottomNavigationMenu />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        backgroundColor: '#00BFFF',
        padding: 15,
    },
    headerText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#ddd',
    },
    activeTab: {
        backgroundColor: '#00BFFF',
    },
    tabText: {
        fontSize: 14,
        color: '#000',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 16,
        color: '#333',
    },
    cardStatus: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF5733',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#aaa',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#aaa',
        marginTop: 20,
    },
});
