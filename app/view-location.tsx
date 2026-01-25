import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Linking, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { ArrowLeft, Navigation, ExternalLink, MapPin, Clock, Car, Footprints } from 'lucide-react-native';
import * as Location from 'expo-location';

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function ViewLocationScreen() {
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    locationName: string;
    serviceName?: string;
    showRoute?: string;
  }>();

  const latitude = parseFloat(params.latitude || '0');
  const longitude = parseFloat(params.longitude || '0');
  const locationName = params.locationName || 'Service Location';
  const serviceName = params.serviceName || '';

  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const destination: Coordinate = { latitude, longitude };

  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userCoord = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setUserLocation(userCoord);
              generateRoute(userCoord, destination);
              setIsLoadingLocation(false);
            },
            (error) => {
              console.log('[ViewLocation] Web geolocation error:', error.message);
              setLocationError('Unable to get your location');
              setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setLocationError('Geolocation not supported');
          setIsLoadingLocation(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoord = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('[ViewLocation] User location:', userCoord);
      setUserLocation(userCoord);
      generateRoute(userCoord, destination);
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('[ViewLocation] Error getting location:', error);
      setLocationError('Failed to get your location');
      setIsLoadingLocation(false);
    }
  };

  const generateRoute = (origin: Coordinate, dest: Coordinate) => {
    const numPoints = 20;
    const points: Coordinate[] = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = origin.latitude + (dest.latitude - origin.latitude) * t;
      const lng = origin.longitude + (dest.longitude - origin.longitude) * t;
      
      const jitter = i > 0 && i < numPoints ? (Math.random() - 0.5) * 0.001 : 0;
      points.push({
        latitude: lat + jitter,
        longitude: lng + jitter,
      });
    }

    setRouteCoordinates(points);

    const dist = calculateDistance(origin, dest);
    setDistance(dist);

    const walkingSpeed = 5;
    const drivingSpeed = 40;
    const avgSpeed = dist > 2 ? drivingSpeed : walkingSpeed;
    const time = (dist / avgSpeed) * 60;
    setDuration(Math.round(time));

    setTimeout(() => {
      fitMapToRoute(origin, dest);
    }, 500);
  };

  const calculateDistance = (start: Coordinate, end: Coordinate): number => {
    const R = 6371;
    const dLat = toRad(end.latitude - start.latitude);
    const dLon = toRad(end.longitude - start.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(start.latitude)) *
        Math.cos(toRad(end.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const fitMapToRoute = (origin: Coordinate, dest: Coordinate) => {
    if (mapRef.current) {
      const coordinates = [origin, dest];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const handleStartNavigation = () => {
    const label = encodeURIComponent(locationName);
    
    let url: string;
    
    if (Platform.OS === 'ios') {
      url = userLocation
        ? `maps://app?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${latitude},${longitude}`
        : `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
    } else if (Platform.OS === 'android') {
      url = userLocation
        ? `google.navigation:q=${latitude},${longitude}&mode=d`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    } else {
      url = userLocation
        ? `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          Linking.openURL(fallbackUrl);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open maps for navigation');
      });
  };

  const handleOpenInMaps = () => {
    const label = encodeURIComponent(locationName);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            Linking.openURL(fallbackUrl);
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Unable to open maps');
        });
    }
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!latitude || !longitude) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }} 
        />
        <View style={styles.errorContainer}>
          <MapPin color="#666" size={48} />
          <Text style={styles.errorText}>Location not available</Text>
          <TouchableOpacity 
            style={styles.backButtonLarge}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{serviceName || 'Service Location'}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{locationName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={serviceName || locationName}
          description={locationName}
        >
          <View style={styles.destinationMarker}>
            <MapPin color="white" size={20} />
          </View>
        </Marker>

        {userLocation && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2D1A46"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {isLoadingLocation && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      <View style={styles.bottomSheet}>
        {userLocation && distance !== null && duration !== null && (
          <View style={styles.routeInfo}>
            <View style={styles.routeInfoItem}>
              <View style={styles.routeIconContainer}>
                {distance > 2 ? (
                  <Car color="#2D1A46" size={20} />
                ) : (
                  <Footprints color="#2D1A46" size={20} />
                )}
              </View>
              <View>
                <Text style={styles.routeValue}>{formatDistance(distance)}</Text>
                <Text style={styles.routeLabel}>Distance</Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeInfoItem}>
              <View style={styles.routeIconContainer}>
                <Clock color="#2D1A46" size={20} />
              </View>
              <View>
                <Text style={styles.routeValue}>{formatDuration(duration)}</Text>
                <Text style={styles.routeLabel}>Est. Time</Text>
              </View>
            </View>
          </View>
        )}

        {locationError && (
          <View style={styles.locationErrorBanner}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
            <TouchableOpacity onPress={getUserLocation}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <MapPin color="#F4A896" size={24} />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationTitle} numberOfLines={2}>{locationName}</Text>
            <Text style={styles.coordinates}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.startNavigationButton}
            onPress={handleStartNavigation}
          >
            <Navigation color="white" size={20} />
            <Text style={styles.startNavigationText}>Start Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.openMapsButton}
            onPress={handleOpenInMaps}
          >
            <ExternalLink color="#2D1A46" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F4A896',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  destinationMarker: {
    backgroundColor: '#F4A896',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 26, 70, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D1A46',
    borderWidth: 2,
    borderColor: 'white',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  routeInfo: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  routeInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1A46',
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  routeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  locationErrorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationErrorText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D1A46',
    marginLeft: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDetails: {
    flex: 1,
    marginLeft: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1A46',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  startNavigationButton: {
    flex: 1,
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startNavigationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  openMapsButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonLarge: {
    backgroundColor: '#2D1A46',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
