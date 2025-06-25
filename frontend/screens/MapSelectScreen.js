import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, FlatList, Keyboard } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const MapSelectScreen = ({ route, navigation }) => {
    const { locationType, previousScreen, existingPickup, existingDropoff } = route.params;
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: 13.7563, // Default: กรุงเทพฯ
        longitude: 100.5018,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        if (searchQuery.length > 2) {
            handleSearch(searchQuery);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    // 📌 ใช้ตำแหน่ง GPS ของผู้ใช้ (เมื่อกดปุ่ม)
    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("❌ กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ");
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude } = location.coords;

            setCurrentLocation({ latitude, longitude });
            setSelectedLocation({ latitude, longitude });
            setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        } catch (error) {
            console.error("❌ Error getting location:", error);
            Alert.alert("❌ ไม่สามารถดึงตำแหน่งได้");
        }
        setLoading(false);
    };

    // 📌 ค้นหาตำแหน่งอัตโนมัติขณะพิมพ์ (เรียงจากใกล้ไปไกล)
    const handleSearch = async (query) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: query, format: "json", limit: 10 },
            });

            let sortedResults = response.data;
            if (currentLocation) {
                sortedResults = response.data.sort((a, b) => {
                    const distA = getDistance(currentLocation, { latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) });
                    const distB = getDistance(currentLocation, { latitude: parseFloat(b.lat), longitude: parseFloat(b.lon) });
                    return distA - distB; // **เรียงจากใกล้ไปไกล**
                });
            }

            setSearchResults(sortedResults);
        } catch (error) {
            console.error("❌ Error searching location:", error);
        }
    };

    // 📌 คำนวณระยะทางระหว่าง 2 จุด (Haversine Formula)
    const getDistance = (loc1, loc2) => {
        if (!loc1 || !loc2) return 0;
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // รัศมีโลก (กม.)

        const dLat = toRad(loc2.latitude - loc1.latitude);
        const dLon = toRad(loc2.longitude - loc1.longitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // ระยะทางเป็นกิโลเมตร
    };

    // 📌 เลือกตำแหน่งจากผลลัพธ์การค้นหา
    const selectLocation = (location) => {
        const latitude = parseFloat(location.lat);
        const longitude = parseFloat(location.lon);

        setSelectedLocation({ latitude, longitude });
        setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setSearchResults([]);
        Keyboard.dismiss();
    };

    // 📌 ยืนยันตำแหน่งที่เลือก
    const handleConfirm = () => {
        if (!selectedLocation) {
            Alert.alert("❌ กรุณาเลือกตำแหน่งก่อน");
            return;
        }

        let distance = 0;
        if (locationType === "pickup" && existingDropoff) {
            distance = getDistance(selectedLocation, existingDropoff);
        } else if (locationType === "dropoff" && existingPickup) {
            distance = getDistance(existingPickup, selectedLocation);
        }

        navigation.navigate(previousScreen, { locationType, selectedLocation, distance });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                {locationType === "pickup" ? "เลือกสถานที่ไปรับ" : "เลือกสถานที่ไปส่ง"}
            </Text>

            {/* 🔍 ช่องค้นหาตำแหน่ง */}
            <TextInput
                style={styles.searchInput}
                placeholder="🔍 ค้นหาสถานที่..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* 📌 รายการผลลัพธ์การค้นหา */}
            {searchResults.length > 0 && (
                <FlatList
                    style={styles.searchResults}
                    data={searchResults}
                    keyExtractor={(item, index) => index.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.resultItem} onPress={() => selectLocation(item)}>
                            <Text>{item.display_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* 🗺️ แสดงแผนที่ */}
            <MapView
                style={styles.map}
                region={mapRegion}
                onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
            >
                {selectedLocation && <Marker coordinate={selectedLocation} title="ตำแหน่งที่เลือก" />}
            </MapView>

            {/* 📌 ปุ่มใช้ตำแหน่งปัจจุบัน */}
            <TouchableOpacity style={styles.gpsButton} onPress={getCurrentLocation}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>📍 ใช้ตำแหน่งปัจจุบัน</Text>}
            </TouchableOpacity>

            {/* ✅ ปุ่มยืนยันตำแหน่ง */}
            <TouchableOpacity
                style={[styles.button, !selectedLocation && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={!selectedLocation}
            >
                <Text style={styles.buttonText}>✅ ยืนยันตำแหน่ง</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { fontSize: 20, textAlign: "center", marginVertical: 10 },
    searchInput: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginHorizontal: 10 },
    searchResults: { maxHeight: 150, backgroundColor: "#fff", marginHorizontal: 10, borderRadius: 5 },
    resultItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
    map: { width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.6 },
    gpsButton: { backgroundColor: "#28a745", padding: 12, margin: 10, borderRadius: 5, alignItems: "center" },
    button: { backgroundColor: "#007AFF", padding: 12, margin: 10, borderRadius: 5, alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    disabledButton: { backgroundColor: "#ccc" },
});

export default MapSelectScreen;
