import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Home, MapPin } from 'lucide-react-native';
import CustomTabBar from '../components/CustomTabBar';

export default function ChooseLocation() {
  const { agentId, date, time } = useLocalSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const locations = [
    {
      id: 'home',
      title: 'At Your Home',
      description: 'Service will be provided at your location',
      icon: Home,
      price: '+$10 travel fee'
    },
    {
      id: 'salon',
      title: 'At Salon',
      description: 'Visit the agent\'s professional salon',
      icon: MapPin,
      price: 'No additional fee'
    }
  ];

  const handleNext = () => {
    if (selectedLocation) {
      router.push(`/booking/summary?agentId=${agentId as string}&date=${date as string}&time=${time as string}&location=${selectedLocation}` as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Location</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Where would you like to receive the service?</Text>

          <View style={styles.locationsContainer}>
            {locations.map((location) => {
              const IconComponent = location.icon;
              return (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    selectedLocation === location.id && styles.selectedLocationCard
                  ]}
                  onPress={() => setSelectedLocation(location.id)}
                >
                  <View style={styles.locationHeader}>
                    <View style={[
                      styles.iconContainer,
                      selectedLocation === location.id && styles.selectedIconContainer
                    ]}>
                      <IconComponent 
                        color={selectedLocation === location.id ? 'white' : '#2D1A46'} 
                        size={24} 
                      />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={[
                        styles.locationTitle,
                        selectedLocation === location.id && styles.selectedLocationText
                      ]}>
                        {location.title}
                      </Text>
                      <Text style={[
                        styles.locationDescription,
                        selectedLocation === location.id && styles.selectedLocationDescription
                      ]}>
                        {location.description}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.locationPrice,
                    selectedLocation === location.id && styles.selectedLocationText
                  ]}>
                    {location.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedLocation && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!selectedLocation}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <CustomTabBar />
    </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#2D1A46',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  locationsContainer: {
    gap: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLocationCard: {
    backgroundColor: '#2D1A46',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: '#F4A896',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  selectedLocationText: {
    color: 'white',
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedLocationDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F4A896',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  nextButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});