import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavigationMenu from '../components/BottomNavigationMenu';

const PriceCalculator = ({ route, navigation }) => {
    const [pickupLocation, setPickupLocation] = useState(null);
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [distance, setDistance] = useState(0);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (route.params) {
            const { locationType, selectedLocation } = route.params;
            if (locationType === 'pickup') {
                setPickupLocation(selectedLocation);
            } else if (locationType === 'delivery') {
                setDeliveryLocation(selectedLocation);
            }
        }
    }, [route.params]);

    useEffect(() => {
        if (pickupLocation && deliveryLocation) {
            const calculateDistance = (loc1, loc2) => {
                const { latitude: lat1, longitude: lon1 } = loc1;
                const { latitude: lat2, longitude: lon2 } = loc2;

                const R = 6371;
                const dLat = (lat2 - lat1) * (Math.PI / 180);
                const dLon = (lon2 - lon1) * (Math.PI / 180);

                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                const distance = R * c;
                setDistance(distance.toFixed(1));
                calculatePrice(distance);
            };

            calculateDistance(pickupLocation, deliveryLocation);
        }
    }, [pickupLocation, deliveryLocation]);

    const calculatePrice = (distance) => {
        let cost = 0;
        if (distance <= 10) {
            cost = 1500;
        } else if (distance <= 20) {
            cost = 2000;
        } else if (distance <= 30) {
            cost = 2500;
        } else if (distance <= 40) {
            cost = 3000;
        } else if (distance <= 50) {
            cost = 3500;
        } else {
            cost = 3500 + (distance - 50) * 100;
        }
        setPrice(Math.round(cost));
    };

    const handleNavigateToBooking = () => {
        navigation.navigate('BookingScreen', {
            pickupLocation,
            deliveryLocation,
            distance,
            price,
        });
    };

    const handleNavigateToMap = (locationType) => {
        navigation.navigate('MapSelectScreen', { locationType });
    };

    return (
        <View style={styles.container}>
        <Text style={styles.header}>คำนวณค่าบริการ</Text>

        {/* กรอบสถานที่ไปรับ */}
        <View style={styles.locationContainer}>
            <View style={styles.locationTextContainer}>
                <Text style={styles.label}>สถานที่ไปรับ:</Text>
                <Text style={styles.locationText}>
                    {pickupLocation
                        ? `${pickupLocation.latitude}, ${pickupLocation.longitude}`
                        : 'ยังไม่เลือก'}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleNavigateToMap('pickup')}>
                <MaterialIcons name="edit-location" size={32} color="#00796B" />
            </TouchableOpacity>
        </View>

        {/* กรอบสถานที่ไปส่ง */}
        <View style={styles.locationContainer}>
            <View style={styles.locationTextContainer}>
                <Text style={styles.label}>สถานที่ไปส่ง:</Text>
                <Text style={styles.locationText}>
                    {deliveryLocation
                        ? `${deliveryLocation.latitude}, ${deliveryLocation.longitude}`
                        : 'ยังไม่เลือก'}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleNavigateToMap('delivery')}>
                <MaterialIcons name="edit-location" size={32} color="#00796B" />
            </TouchableOpacity>
        </View>

        {/* ข้อมูลระยะทางและราคา */}
        <View style={styles.infoContainer}>
            <Text style={styles.distanceText}>ระยะทาง: {distance} กม.</Text>
            <Text style={styles.priceText}>ราคา: {price} บาท</Text>
        </View>

        {/* ปุ่มเรียกรถ (แสดงเฉพาะเมื่อ price คำนวณเสร็จแล้ว) */}
        {price > 0 && (
            <TouchableOpacity style={styles.button} onPress={handleNavigateToBooking}>
                <Text style={styles.buttonText}>เรียกรถ</Text>
            </TouchableOpacity>
        )}
        <BottomNavigationMenu />
    </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#E6F7FF' },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#004D40', marginBottom: 20 },

    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#B0BEC5',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginVertical: 10,
    },
    locationTextContainer: { flex: 1 },
    label: { fontSize: 16, color: '#004D40', fontWeight: 'bold' },
    locationText: { fontSize: 14, color: '#455A64', marginTop: 5 },

    infoContainer: { marginTop: 20 },
    distanceText: { fontSize: 18, fontWeight: 'bold', color: '#00695C', textAlign: 'center' },
    priceText: { fontSize: 18, fontWeight: 'bold', color: '#D84315', textAlign: 'center', marginTop: 10 },

    button: {
        
        marginTop: 400,
        backgroundColor: '#00796B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default PriceCalculator;
