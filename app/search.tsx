import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, FlatList, Image, ActivityIndicator } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useGetAllServicesQuery, useGetAllCategoriesQuery } from '@/store/services/servicesApi';
import { useGetApprovedProvidersQuery } from '@/store/services/profileApi';
import { router } from 'expo-router';
import * as Location from 'expo-location';

export default function SearchScreen() {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState(5); // miles
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const [minRating, setMinRating] = useState(0);
    const [, setAvailabilityDate] = useState('');
    const [, setAvailabilityTime] = useState('');

    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data: categories } = useGetAllCategoriesQuery();

    const queryParams: any = {};
    if (searchQuery) queryParams.search = searchQuery;
    if (selectedCategory) queryParams.category = selectedCategory.toString();
    if (minPrice > 0) queryParams.min_price = minPrice.toString();
    if (maxPrice < 500) queryParams.max_price = maxPrice.toString();
    if (minRating > 0) queryParams.min_rating = minRating.toString();
    if (currentLocation && radius) {
        queryParams.lat = currentLocation.coords.latitude.toString();
        queryParams.lng = currentLocation.coords.longitude.toString();
        queryParams.radius = radius.toString();
    }

    const { data: services, isLoading } = useGetAllServicesQuery(queryParams);
    const { data: providers } = useGetApprovedProvidersQuery(queryParams);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation(location);
            }
        })();
    }, []);

    const handleServicePress = (serviceId: string) => {
        router.push(`/service-detail?id=${serviceId}` as any);
    };

    const handleProviderPress = (providerId: number) => {
        router.push(`/provider-detail?id=${providerId}` as any);
    };

    const toggleFilters = () => setShowFilters(!showFilters);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setLocation('');
        setRadius(5);
        setMinPrice(0);
        setMaxPrice(500);
        setMinRating(0);
        setAvailabilityDate('');
        setAvailabilityTime('');
    };

    const renderResultItem = ({ item }: { item: any }) => {
        const isService = item.hasOwnProperty('provider_details');
        if (isService) {
            return (
                <TouchableOpacity style={styles.resultCard} onPress={() => handleServicePress(item.id)}>
                    <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} style={styles.resultImage} />
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultProvider}>by {item.provider_details?.full_name}</Text>
                        <View style={styles.resultMeta}>
                            <Text style={styles.resultPrice}>{Math.floor(Number(item.price))} {item.currency}</Text>
                            <Text style={styles.resultRating}>⭐ {item.provider_details?.rating || 'N/A'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={styles.resultCard} onPress={() => handleProviderPress(item.pkid)}>
                    <View style={styles.resultImagePlaceholder}>
                        <Text style={{ fontSize: 32 }}>👤</Text>
                    </View>
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{item.full_name}</Text>
                        <Text style={styles.resultProvider}>{item.about_me}</Text>
                        <View style={styles.resultMeta}>
                            <Text style={styles.resultLocation}>📍 {item.city}</Text>
                            <Text style={styles.resultRating}>⭐ {item.rating || 'N/A'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    const results = [...(services || []), ...(providers || [])];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search color="#666" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('searchPlaceholder') || 'Search services or providers...'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color="#666" size={20} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
                    <Text style={styles.filterButtonText}>{t('filters')}</Text>
                </TouchableOpacity>
            </View>

            {showFilters && (
                <ScrollView style={styles.filtersContainer}>
                    <Text style={styles.filtersTitle}>{t('filters')}</Text>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>{t('category')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories?.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryChip, selectedCategory === cat.pkid && styles.categoryChipSelected]}
                                    onPress={() => setSelectedCategory(selectedCategory === cat.pkid ? null : cat.pkid)}
                                >
                                    <Text style={[styles.categoryChipText, selectedCategory === cat.pkid && styles.categoryChipTextSelected]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>{t('location')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter location"
                            value={location}
                            onChangeText={setLocation}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Radius (miles)"
                            value={radius.toString()}
                            onChangeText={(text) => {
                                const num = parseInt(text.replace(/[^0-9]/g, '')) || 1;
                                setRadius(Math.min(50, Math.max(1, num)));
                            }}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>{t('priceRange')}</Text>
                        <View style={styles.priceInputs}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Min price"
                                value={minPrice.toString()}
                                onChangeText={(text) => setMinPrice(parseInt(text.replace(/[^0-9]/g, '')) || 0)}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                                placeholder="Max price"
                                value={maxPrice.toString()}
                                onChangeText={(text) => setMaxPrice(parseInt(text.replace(/[^0-9]/g, '')) || 500)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>{t('minRating')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum rating (0-5)"
                            value={minRating.toString()}
                            onChangeText={(text) => {
                                const num = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                                setMinRating(Math.min(5, Math.max(0, num)));
                            }}
                            keyboardType="decimal-pad"
                        />
                        <Text>{minRating} stars and up</Text>
                    </View>

                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>{t('clearAll')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>{results.length} results</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#2D1A46" />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => (item as any).id || (item as any).pkid?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.resultsList}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'white',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: '#2D1A46',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
    },
    filterButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    filtersContainer: {
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 10,
    },
    filtersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    filterSection: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    priceInputs: {
        flexDirection: 'row',
    },
    sliderContainer: {
        marginTop: 8,
    },
    categoryChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipSelected: {
        backgroundColor: '#2D1A46',
    },
    categoryChipText: {
        color: '#333',
    },
    categoryChipTextSelected: {
        color: 'white',
    },
    clearButton: {
        backgroundColor: '#F4A896',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    resultsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: '600',
    },
    resultsList: {
        paddingHorizontal: 16,
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    resultImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    resultImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F4A896',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1A46',
    },
    resultProvider: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    resultMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D1A46',
    },
    resultRating: {
        fontSize: 14,
        color: '#666',
    },
    resultLocation: {
        fontSize: 12,
        color: '#666',
    },
});
