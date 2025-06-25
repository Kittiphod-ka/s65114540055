import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const NavigationScreen = ({ route }) => {
    const { pickup, dropoff } = route.params;
    const [routeCoords, setRouteCoords] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const mapRef = useRef(null);

    useEffect(() => {
        getDirections();
        trackUserLocation();
    }, []);

    // 📌 ดึงเส้นทางจาก Google Maps API
    const getDirections = async () => {
        const GOOGLE_MAPS_API_KEY = "ใส่ api"; // 🔑 ใส่ API Key 
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

        try {
            const response = await axios.get(url);
            const points = response.data.routes[0].overview_polyline.points;
            setRouteCoords(decodePolyline(points));
        } catch (error) {
            console.error("❌ Error fetching directions:", error);
        }
    };

    // 📌 ติดตามตำแหน่งผู้ใช้และหมุนแผนที่ตามทิศทางที่ขับ
    const trackUserLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            console.error("❌ Permission denied for location tracking");
            return;
        }

        Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
            (location) => {
                setUserLocation(location.coords);
                setHeading(location.coords.heading || 0);

                // ✅ อัปเดตแผนที่ให้หมุนตามรถ
                if (mapRef.current) {
                    mapRef.current.animateCamera({
                        center: {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        },
                        heading: location.coords.heading,
                        pitch: 80, // ทำให้แผนที่ดู 3D มากขึ้น
                        zoom: 18, // ซูมใกล้ขึ้น
                    });
                }
            }
        );
    };

    // 📌 แปลง Polyline ให้เป็นพิกัด
    const decodePolyline = (encoded) => {
        let points = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }
        return points;
    };

    return (
        <View style={styles.container}>
            <MapView 
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: pickup.latitude,
                    longitude: pickup.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02
                }}
                pitchEnabled
                showsBuildings
            >
                <Marker coordinate={pickup} title="📍 จุดรับ" />
                <Marker coordinate={dropoff} title="📍 จุดส่ง" />
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="🚗 ตำแหน่งของคุณ"
                        pinColor="blue"
                        rotation={heading} // หันไปตามทิศทางที่ขับ
                    />
                )}
                <Polyline coordinates={routeCoords} strokeWidth={6} strokeColor="blue" />
            </MapView>
        </View>
    );
};

export default NavigationScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
});
