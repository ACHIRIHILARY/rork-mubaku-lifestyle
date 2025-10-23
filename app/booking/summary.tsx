import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { mockAgents } from '../mockData';

export default function BookingSummary() {
  const { agentId, date, time, location } = useLocalSearchParams();
  const agent = mockAgents.find(a => a.id === agentId);

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Agent not found</Text>
      </SafeAreaView>
    );
  }

  const locationFee = location === 'home' ? 10 : 0;
  const subtotal = agent.price;
  const total = subtotal + locationFee;

  const handleConfirmBooking = () => {
    router.push(`/booking/payment?agentId=${agentId}&date=${date}&time=${time}&location=${location}&total=${total}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Agent Info */}
        <View style={styles.card}>
          <View style={styles.agentInfo}>
            <Image source={{ uri: agent.image }} style={styles.agentImage} />
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentService}>{agent.service}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Calendar color="#666" size={20} />
            <Text style={styles.detailText}>
              {new Date(date as string).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock color="#666" size={20} />
            <Text style={styles.detailText}>{time}</Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin color="#666" size={20} />
            <Text style={styles.detailText}>
              {location === 'home' ? 'At Your Home' : 'At Salon'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <User color="#666" size={20} />
            <Text style={styles.detailText}>Duration: 90 minutes</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>${subtotal}</Text>
          </View>

          {locationFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Travel Fee</Text>
              <Text style={styles.priceValue}>${locationFee}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
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
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  agentService: {
    fontSize: 14,
    color: '#666',
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  confirmButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});