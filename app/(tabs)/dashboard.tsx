import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { DollarSign, Star, TrendingUp, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function ProviderDashboardScreen() {
    const { t } = useTranslation();

    // Mock data - replace with actual API calls
    const earnings = {
        daily: 250,
        weekly: 1750,
        monthly: 7000,
    };

    const upcomingBookings = [
        { id: '1', client: 'John Doe', service: 'Haircut', time: '2:00 PM', date: 'Today' },
        { id: '2', client: 'Jane Smith', service: 'Massage', time: '4:00 PM', date: 'Tomorrow' },
    ];

    const recentReviews = [
        { id: '1', client: 'Alice Johnson', rating: 5, comment: 'Great service!' },
        { id: '2', client: 'Bob Wilson', rating: 4, comment: 'Very professional.' },
    ];

    const analytics = {
        bookingConversion: 85,
        profileViews: 120,
        overallRating: 4.7,
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('providerDashboard')}</Text>
                    <Text style={styles.headerSubtitle}>{t('manageYourBusiness')}</Text>
                </View>

                {/* Earnings Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('earnings')}</Text>
                    <View style={styles.earningsGrid}>
                        <View style={styles.earningCard}>
                            <DollarSign color="#4CAF50" size={24} />
                            <Text style={styles.earningAmount}>${earnings.daily}</Text>
                            <Text style={styles.earningLabel}>{t('today')}</Text>
                        </View>
                        <View style={styles.earningCard}>
                            <DollarSign color="#2196F3" size={24} />
                            <Text style={styles.earningAmount}>${earnings.weekly}</Text>
                            <Text style={styles.earningLabel}>{t('thisWeek')}</Text>
                        </View>
                        <View style={styles.earningCard}>
                            <DollarSign color="#9C27B0" size={24} />
                            <Text style={styles.earningAmount}>${earnings.monthly}</Text>
                            <Text style={styles.earningLabel}>{t('thisMonth')}</Text>
                        </View>
                    </View>
                </View>

                {/* Upcoming Bookings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('upcomingBookings')}</Text>
                    {upcomingBookings.map((booking) => (
                        <View key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingInfo}>
                                <Text style={styles.bookingClient}>{booking.client}</Text>
                                <Text style={styles.bookingService}>{booking.service}</Text>
                                <Text style={styles.bookingTime}>{booking.date} at {booking.time}</Text>
                            </View>
                            <TouchableOpacity style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>{t('view')}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Recent Reviews */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('recentReviews')}</Text>
                    {recentReviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewClient}>{review.client}</Text>
                                <View style={styles.rating}>
                                    <Star color="#FFD700" size={16} fill="#FFD700" />
                                    <Text style={styles.ratingText}>{review.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                        </View>
                    ))}
                </View>

                {/* Performance Analytics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('performance')}</Text>
                    <View style={styles.analyticsGrid}>
                        <View style={styles.analyticsCard}>
                            <TrendingUp color="#4CAF50" size={24} />
                            <Text style={styles.analyticsValue}>{analytics.bookingConversion}%</Text>
                            <Text style={styles.analyticsLabel}>{t('bookingConversion')}</Text>
                        </View>
                        <View style={styles.analyticsCard}>
                            <Users color="#2196F3" size={24} />
                            <Text style={styles.analyticsValue}>{analytics.profileViews}</Text>
                            <Text style={styles.analyticsLabel}>{t('profileViews')}</Text>
                        </View>
                        <View style={styles.analyticsCard}>
                            <Star color="#FFD700" size={24} />
                            <Text style={styles.analyticsValue}>{analytics.overallRating}</Text>
                            <Text style={styles.analyticsLabel}>{t('overallRating')}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/provider-services' as any)}
                        >
                            <Text style={styles.actionButtonText}>{t('manageServices')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/provider-availability' as any)}
                        >
                            <Text style={styles.actionButtonText}>{t('updateAvailability')}</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#F4A896',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginBottom: 16,
    },
    earningsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    earningCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    earningAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginTop: 8,
    },
    earningLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    bookingCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bookingInfo: {
        flex: 1,
    },
    bookingClient: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1A46',
    },
    bookingService: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    bookingTime: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: '#F4A896',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    reviewCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewClient: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1A46',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    reviewComment: {
        fontSize: 14,
        color: '#666',
    },
    analyticsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    analyticsCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    analyticsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginTop: 8,
    },
    analyticsLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    actionsGrid: {
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#2D1A46',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
