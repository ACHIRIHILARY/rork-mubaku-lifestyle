import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, RefreshControl, TextInput } from 'react-native';
import { Plus, Edit, Trash2, DollarSign, Clock, BarChart3, ArrowLeft, Star, Power, MapPin, Navigation } from 'lucide-react-native';
import { useGetMyServicesQuery, useDeleteServiceMutation, useGetMyServiceStatsQuery, useUpdateServiceMutation } from '@/store/services/servicesApi';

export default function ProviderServicesScreen() {
  const { data: services, isLoading: servicesLoading, refetch, isFetching } = useGetMyServicesQuery();
  const { data: stats } = useGetMyServiceStatsQuery();
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(serviceId).unwrap();
              Alert.alert('Success', 'Service deleted successfully');
              refetch();
            } catch (error: any) {
              console.error('Delete service error:', error);
              const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to delete service';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await updateService({ 
        serviceId, 
        data: { is_active: !currentStatus } 
      }).unwrap();
      refetch();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to update service status';
      Alert.alert('Error', errorMessage);
    }
  };

  const filteredServices = services?.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'My Services',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#2D1A46" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#F4A896',
          },
          headerTintColor: 'white',
        }} 
      />
      
      {stats && (
        <View style={styles.statsWrapper}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BarChart3 color="#2D1A46" size={20} />
              <Text style={styles.statValue}>{stats.total_services || 0}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statCard}>
              <Power color="#4CAF50" size={20} />
              <Text style={styles.statValue}>{stats.active_services || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Clock color="#F4A896" size={20} />
              <Text style={styles.statValue}>{stats.total_bookings || 0}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign color="#4CAF50" size={20} />
              <Text style={styles.statValue}>
                {typeof stats.total_revenue === 'number' ? `XAF ${stats.total_revenue.toFixed(2)}` : 'XAF 0.00'}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
          {stats.average_rating > 0 && (
            <View style={styles.ratingCard}>
              <Star color="#FFD700" size={20} fill="#FFD700" />
              <Text style={styles.statValue}>
                {typeof stats.average_rating === 'number' ? stats.average_rating.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/provider-services/create' as any)}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {servicesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
          </View>
        ) : !filteredServices || filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BarChart3 color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>No Services Yet</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No services match your search' 
                : 'Create your first service to start accepting bookings'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.createFirstButton}
                onPress={() => router.push('/provider-services/create' as any)}
              >
                <Plus color="white" size={20} />
                <Text style={styles.createFirstButtonText}>Create Service</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            {filteredServices.map((service) => {
              const hasLocation = !!((service as any).latitude && (service as any).longitude);
              return (
              <View key={service.id} style={[
                styles.serviceCard,
                !hasLocation && styles.serviceCardNoLocation
              ]}>
                {!hasLocation && (
                  <View style={styles.locationWarning}>
                    <MapPin color="#FF4444" size={14} />
                    <Text style={styles.locationWarningText}>No location set</Text>
                  </View>
                )}
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCategory}>
                      {service.category_name || 'Category'}
                    </Text>
                    {service.description && (
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: service.is_active ? '#E8F5E9' : '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: service.is_active ? '#4CAF50' : '#F44336' }
                    ]}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceDetails}>
                  <View style={styles.detailRow}>
                    <Clock color="#666" size={16} />
                    <Text style={styles.detailText}>{service.duration_minutes} min</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign color="#666" size={16} />
                    <Text style={styles.detailText}>{service.price} {service.currency}</Text>
                  </View>
                  {(service as any).total_bookings !== undefined && (
                    <View style={styles.detailRow}>
                      <BarChart3 color="#666" size={16} />
                      <Text style={styles.detailText}>{(service as any).total_bookings} bookings</Text>
                    </View>
                  )}
                </View>

                {hasLocation && (
                  <TouchableOpacity
                    style={styles.viewLocationButton}
                    onPress={() => router.push(`/view-location?latitude=${(service as any).latitude}&longitude=${(service as any).longitude}&locationName=${encodeURIComponent((service as any).location || 'Service Location')}&serviceName=${encodeURIComponent(service.name)}` as any)}
                  >
                    <Navigation color="#2D1A46" size={16} />
                    <Text style={styles.viewLocationButtonText}>View Location</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => handleToggleStatus(service.id, service.is_active)}
                  >
                    <Power color={service.is_active ? '#4CAF50' : '#999'} size={18} />
                    <Text style={[styles.toggleButtonText, { color: service.is_active ? '#4CAF50' : '#999' }]}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/provider-services/edit?id=${service.id}`)}
                  >
                    <Edit color="#2D1A46" size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteService(service.id, service.name)}
                  >
                    <Trash2 color="#FF4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2D1A46',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createFirstButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  toggleButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
  },
  serviceCardNoLocation: {
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationWarningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF4444',
  },
  viewLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF5F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F4A896',
  },
  viewLocationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
});
