import { router } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Search, X, User, Star } from 'lucide-react-native';
import { useGetApprovedProvidersQuery } from '@/store/services/profileApi';

export default function ProvidersScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const { data: providers, isLoading } = useGetApprovedProvidersQuery();

  const handleProviderPress = (providerId: number) => {
    router.push(`/provider-detail?id=${providerId}` as any);
  };

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);

  const filteredProviders = React.useMemo(() => {
    if (!providers) return [];

    if (!debouncedSearch.trim()) return providers;

    const query = debouncedSearch.toLowerCase();
    return providers.filter(provider =>
      provider.full_name?.toLowerCase().includes(query) ||
      provider.city?.toLowerCase().includes(query) ||
      provider.about_me?.toLowerCase().includes(query)
    );
  }, [providers, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Service Providers</Text>
          <Text style={styles.headerSubtitle}>Find and connect with professionals</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X color="#666" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {/* Providers Grid */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2D1A46" />
              <Text style={styles.loadingText}>Loading providers...</Text>
            </View>
          ) : filteredProviders && filteredProviders.length > 0 ? (
            <View style={styles.providersGrid}>
              {filteredProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.pkid}
                  style={styles.providerCard}
                  onPress={() => handleProviderPress(provider.pkid)}
                >
                  <View style={styles.providerImageContainer}>
                    {provider.profile_photo ? (
                      <Image source={{ uri: provider.profile_photo }} style={styles.providerImage} />
                    ) : (
                      <View style={styles.providerImagePlaceholder}>
                        <User color="white" size={24} />
                      </View>
                    )}
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName} numberOfLines={1}>
                      {provider.full_name}
                    </Text>
                    <Text style={styles.providerLocation} numberOfLines={1}>
                      📍 {provider.city || 'Location not set'}
                    </Text>
                    {provider.about_me && (
                      <Text style={styles.providerAbout} numberOfLines={2}>
                        {provider.about_me}
                      </Text>
                    )}
                    <View style={styles.providerRating}>
                      <Star color="#FFD700" size={14} fill="#FFD700" />
                      <Text style={styles.ratingText}>4.8</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {debouncedSearch ? 'No providers found matching your search' : 'No service providers available'}
              </Text>
              {debouncedSearch && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={handleClearSearch}
                >
                  <Text style={styles.clearAllButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%', // 2 columns
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  providerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    alignItems: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
    textAlign: 'center',
  },
  providerLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  providerAbout: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearAllButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  clearAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
