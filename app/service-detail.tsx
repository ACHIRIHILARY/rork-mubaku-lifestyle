import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { ArrowLeft, Star, MapPin, Clock } from 'lucide-react-native';
import { mockAgents } from './mockData';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const agent = mockAgents.find(a => a.id === id);

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Agent not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Agent Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: agent.image }} style={styles.agentImage} />
        </View>

        {/* Agent Info */}
        <View style={styles.content}>
          <View style={styles.agentHeader}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <View style={styles.ratingContainer}>
              <Star color="#FFD700" size={20} fill="#FFD700" />
              <Text style={styles.rating}>{agent.rating}</Text>
            </View>
          </View>

          <Text style={styles.service}>{agent.service}</Text>
          <Text style={styles.experience}>{agent.experience} experience</Text>

          {/* Service Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Service Details</Text>
            
            <View style={styles.detailRow}>
              <Clock color="#666" size={20} />
              <Text style={styles.detailText}>Duration: 90 minutes</Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin color="#666" size={20} />
              <Text style={styles.detailText}>Available at home or salon</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.price}>${agent.price}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.description}>{agent.description}</Text>
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesCard}>
            <Text style={styles.cardTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {agent.specialty.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => router.push(`/booking/select-datetime?agentId=${agent.id}`)}
        >
          <Text style={styles.bookButtonText}>Book Service</Text>
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
  imageContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  agentImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  content: {
    paddingHorizontal: 24,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  service: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  specialtiesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#F4A896',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  specialtyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  bookingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bookButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});