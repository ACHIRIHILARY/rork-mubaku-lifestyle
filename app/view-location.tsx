import { router, useLocalSearchParams, Stack } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, Navigation, ExternalLink } from 'lucide-react-native';

export default function ViewLocationScreen() {
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    locationName: string;
    serviceName?: string;
  }>();

  const latitude = parseFloat(params.latitude || '0');
  const longitude = parseFloat(params.longitude || '0');
  const locationName = params.locationName || 'Service Location';
  const serviceName = params.serviceName || '';

  if (!latitude || !longitude) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location not available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenInMaps = () => {
    const label = encodeURIComponent(locationName);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      web: `https://www.google.com/maps/search/?api=AIzaSyCl2wtzcjTd1ekKgpNNgQRNuqRjtM8qRic&query=${latitude},${longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            const fallbackUrl = `https://www.google.com/maps/search/?api=AIzaSyCl2wtzcjTd1ekKgpNNgQRNuqRjtM8qRic&query=${latitude},${longitude}`;
            Linking.openURL(fallbackUrl);
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Unable to open maps');
        });
    }
  };

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
          <Text style={styles.headerSubtitle}>{locationName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={serviceName || locationName}
          description={locationName}
          pinColor="#F4A896"
        />
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.locationInfo}>
          <Navigation color="#2D1A46" size={24} />
          <View style={styles.locationDetails}>
            <Text style={styles.locationTitle}>{locationName}</Text>
            <Text style={styles.coordinates}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.openMapsButton}
          onPress={handleOpenInMaps}
        >
          <ExternalLink color="white" size={20} />
          <Text style={styles.openMapsButtonText}>Open in Maps</Text>
        </TouchableOpacity>
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1A46',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 13,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }) as any,
  },
  openMapsButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  openMapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  backButton: {
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
